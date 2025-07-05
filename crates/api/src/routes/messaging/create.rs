use std::time::{SystemTime, UNIX_EPOCH};

use axum::{Extension, Json, extract::State};
use models::{channels::Channel, messages::Message, users::Account};
use rt_actors::message::Dispatch;
use serde::Deserialize;
use serde_valid::Validate;
use ulid::Ulid;

use crate::utils::publishing::publish_group;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateMessage {
    #[validate(min_length = 1)]
    #[validate(max_length = 2048)]
    content: String,
    #[serde(default)]
    #[validate(max_length = 50)]
    nonce: Option<String>,
}

pub async fn route(
    State(state): State<crate::State>,
    Extension(account): Extension<Account>,
    Extension(channel): Extension<Channel>,
    Json(model): Json<CreateMessage>,
) -> Result<Json<Message>, crate::Error> {
    let start = SystemTime::now();
    let now = start.duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
    let message = sqlx::query_as!(Message, "INSERT INTO messages (id, content, author_id, channel_id, created_at, last_modified_at, nonce) VALUES ($1, $2, $3, $4, $5, $5, $6) RETURNING *;", Ulid::new().to_string(), model.content, account.id, channel.id, now, model.nonce).fetch_one(&state.pg).await?;
    sqlx::query!(
        "UPDATE channels SET last_message_id = $1 WHERE id = $2;",
        message.id,
        channel.id
    )
    .execute(&state.pg)
    .await?;

    publish_group(&channel.id, Dispatch::MessageCreate(message.clone())).await?;

    Ok(Json(message))
}
