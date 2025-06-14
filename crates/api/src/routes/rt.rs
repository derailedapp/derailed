use std::sync::Arc;

use axum::{
    extract::{
        State, WebSocketUpgrade,
        ws::{CloseFrame, Utf8Bytes, WebSocket},
    },
    response::{IntoResponse, Response},
    routing::any,
};
use futures_util::{SinkExt, StreamExt, stream::SplitStream};
use rt_actors::message::Dispatch;
use serde::{Deserialize, Serialize};
use tokio::sync::{
    Mutex,
    mpsc::{UnboundedSender, unbounded_channel},
};

pub fn router() -> axum::Router<crate::State> {
    axum::Router::new().route("/rt", any(handler))
}

#[derive(Serialize)]
pub struct GatewayMessage {
    op: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    d: Option<Dispatch>,
    seq: i32,
}

async fn handler(ws: WebSocketUpgrade, State(state): State<crate::State>) -> Response {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: crate::State) {
    let (mut sink, stream) = socket.split();
    let (sender, mut receiver) = unbounded_channel();

    let sequence = Arc::new(Mutex::new(0));
    let should_close: Arc<Mutex<Option<crate::Error>>> = Arc::new(Mutex::new(None));
    tokio::spawn(handle_messages(stream, sender, state, should_close.clone()));

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
                    d: Some(message),
                    seq: seq.clone(),
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
) {
    while let Some(Ok(msg)) = stream.next().await {
        if let Ok(msg) = msg.to_text() {
            if let Ok(msg) = serde_json::from_str::<UserMessage>(msg) {
                if let Err(err) = handle_message(msg).await {
                    let mut should = should_close.lock().await;
                    *should = Some(err);
                }
            }
        }
    }
}

async fn handle_message(msg: UserMessage) -> Result<(), crate::Error> {
    Ok(())
}
