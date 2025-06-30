use std::sync::Arc;

use axum::{
    extract::{State, WebSocketUpgrade, ws::WebSocket},
    response::Response,
    routing::any,
};
use futures_util::{SinkExt, StreamExt, stream::SplitStream};
use models::{
    channels::Channel,
    messages::ReadState,
    users::{Account, UserActor},
};
use ractor::{Actor, RpcReplyPort, rpc::call};
use rt_actors::{
    message::{Dispatch, RTChannel, Relationship},
    sessions::{Args as SessionArgs, Session},
};
use serde::{Deserialize, Serialize};
use sha2::Digest;
use sqlx::PgPool;
use tokio::sync::{
    Mutex,
    mpsc::{UnboundedSender, unbounded_channel},
};
use ulid::Ulid;

pub fn router() -> axum::Router<crate::State> {
    axum::Router::new().route("/rt", any(handler))
}

#[derive(Serialize)]
pub struct GatewayMessage {
    op: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    e: Option<Dispatch>,
    seq: i32,
}

async fn handler(ws: WebSocketUpgrade, State(state): State<crate::State>) -> Response {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: crate::State) {
    let (mut sink, stream) = socket.split();
    let (sender, mut receiver) = unbounded_channel();

    let sequence = Arc::new(Mutex::new(0));
    let session_id: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    let should_close: Arc<Mutex<Option<crate::Error>>> = Arc::new(Mutex::new(None));
    tokio::spawn(handle_messages(
        stream,
        sender,
        state,
        should_close.clone(),
        session_id.clone(),
    ));

    while !receiver.is_closed() {
        let msg = receiver.recv().await;
        if let Some(message) = msg {
            if let Dispatch::WSClose = message {
                // TODO
                //let err = should_close.lock().await;
                //if let Some(err) = err {
                //    let resp = err.into_response();
                //    sink.send(axum::extract::ws::Message::Close(Some(CloseFrame {
                //        code: resp.status().as_u16(),
                //        reason: "".into()
                //    }))).await;
                //}
                receiver.close();
                return;
            }
            let json = {
                let mut seq = sequence.lock().await;
                *seq += 1;
                serde_json::to_string(&GatewayMessage {
                    op: "Dispatch".to_string(),
                    e: Some(message),
                    seq: *seq,
                })
                .unwrap()
            };
            let _ = sink
                .send(axum::extract::ws::Message::Text(json.into()))
                .await;
        } else {
            let _ = sink.close().await;
            return;
        }
    }
    let sid = session_id.lock().await;
    if sid.is_some()
        && let Some(session_cell) = ractor::registry::where_is(sid.clone().unwrap()) {
            let _ = call(&session_cell, |_: RpcReplyPort<()>| Dispatch::WSClose, None).await;
        }
}

#[derive(Deserialize)]
#[serde(tag = "op", content = "d")]
pub enum UserMessage {
    Identify { token: String },
}

async fn handle_messages(
    mut stream: SplitStream<WebSocket>,
    sender: UnboundedSender<Dispatch>,
    state: crate::State,
    should_close: Arc<Mutex<Option<crate::Error>>>,
    session_id: Arc<Mutex<Option<String>>>,
) {
    while let Some(Ok(msg)) = stream.next().await {
        if let Ok(msg) = msg.to_text()
            && let Ok(msg) = serde_json::from_str::<UserMessage>(msg)
            && let Err(err) =
                handle_message(msg, session_id.clone(), sender.clone(), &state.pg).await
        {
            let mut should = should_close.lock().await;
            *should = Some(err);
            let _ = sender.send(Dispatch::WSClose);
        }
    }
}

async fn get_channel_data(
    channel: Channel,
    current_user_id: &String,
    pg: &PgPool,
) -> Result<RTChannel, crate::Error> {
    let members = sqlx::query_as!(UserActor, "SELECT * FROM actors WHERE id IN (SELECT user_id FROM channel_members WHERE channel_id = $1);", channel.id).fetch_all(pg).await?;
    let read_state = sqlx::query_as!(
        ReadState,
        "SELECT * FROM read_states WHERE user_id = $1 AND channel_id = $2;",
        current_user_id,
        channel.id
    )
    .fetch_one(pg)
    .await?;
    Ok(RTChannel {
        channel,
        members,
        read_state,
    })
}

async fn handle_message(
    msg: UserMessage,
    session_id: Arc<Mutex<Option<String>>>,
    sender: UnboundedSender<Dispatch>,
    pg: &PgPool,
) -> Result<(), crate::Error> {
    let mut session_id = session_id.lock().await;
    match msg {
        UserMessage::Identify { token } => {
            if session_id.is_some() {
                return Err(crate::Error::AlreadyIdentified);
            }
            *session_id = Some(Ulid::new().to_string());
            let token = hex::encode(sha2::Sha256::digest(token.as_bytes()));

            let account = sqlx::query_as!(
                Account,
                "SELECT * FROM accounts WHERE id IN (SELECT account_id FROM sessions WHERE id = $1);",
                token
            )
            .fetch_optional(pg)
            .await?
            .ok_or(crate::Error::TokenInvalid)?;

            let actor =
                sqlx::query_as!(UserActor, "SELECT * FROM actors WHERE id = $1;", account.id)
                    .fetch_optional(pg)
                    .await?
                    .ok_or(crate::Error::TokenInvalid)?;

            let joined_channels = sqlx::query_as!(Channel, "SELECT * FROM channels WHERE id IN (SELECT channel_id FROM channel_members WHERE user_id = $1);", account.id).fetch_all(pg).await?;
            let joined_channel_ids = joined_channels
                .iter()
                .map(|c| c.id.clone())
                .collect::<Vec<String>>();

            let (_, handle) = Actor::spawn(
                session_id.clone(),
                Session,
                SessionArgs {
                    user_id: account.id.clone(),
                    session_id: session_id.clone().unwrap(),
                    joined_guilds: Vec::new(),
                    joined_channels: joined_channel_ids,
                    ws: sender.clone(),
                },
            )
            .await
            .map_err(|_| crate::Error::ActorError)?;
            tokio::spawn(handle);
            let relationships = sqlx::query!(
                "SELECT * FROM relationships WHERE user_id = $1;",
                account.id
            )
            .fetch_all(pg)
            .await?;
            let relationships =
                futures::future::join_all(relationships.into_iter().map(async |r| {
                    let actor = sqlx::query_as!(
                        UserActor,
                        "SELECT * FROM actors WHERE id = $1;",
                        r.target_user_id
                    )
                    .fetch_one(pg)
                    .await?;
                    Ok(Relationship {
                        target: actor,
                        r#type: r.r#type,
                    })
                }))
                .await
                .into_iter()
                .collect::<Result<Vec<Relationship>, crate::Error>>()?;
            let channels = futures::future::join_all(
                joined_channels
                    .into_iter()
                    .map(|channel| get_channel_data(channel, &account.id, pg)),
            )
            .await
            .into_iter()
            .collect::<Result<Vec<RTChannel>, crate::Error>>()?;
            sender
                .send(Dispatch::Ready {
                    session_id: session_id.clone().unwrap(),
                    channels,
                    actor,
                    account,
                    relationships,
                })
                .map_err(|_| crate::Error::ActorError)?;
        }
    }
    Ok(())
}
