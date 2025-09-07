use models::{channels::Channel, messages::Message, users::Account};
use axum::{extract::{Path, State, Json}, Extension};
use serde::Deserialize;
use serde_valid::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct ModifyMessage {
    #[serde(default)]
    #[validate(min_length = 1)]
    #[validate(max_length = 2048)]
    content: Option<String>
}

pub async fn route(
    State(state): State<crate::State>,
    Extension(account): Extension<Account>,
    Extension(_): Extension<Channel>,
    Path(message_id): Path<String>,
    Json(model): Json<ModifyMessage>,
) -> Result<Json<Message>, crate::Error> {
    let message = sqlx::query_as!(Message, "SELECT * FROM messages WHERE id = $1;", message_id).fetch_optional(&state.pg).await?;
    if let Some(mut message) = message {
        if message.author_id != account.id {
            return Err(crate::Error::MessageCantDelete);
        }
        if let Some(content) = model.content {
            sqlx::query!("UPDATE messages SET content = $2 WHERE id = $1;", message.id, content).execute(&state.pg).await?;
            message.content = content;
        }
        Ok(Json(message))
    } else {
        Err(crate::Error::MessageNotFound)
    }
}