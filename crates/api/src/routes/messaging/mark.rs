use models::{channels::Channel, users::Account};
use axum::{extract::{Path, State}, Extension};

pub async fn route(
    State(state): State<crate::State>,
    Extension(account): Extension<Account>,
    Extension(channel): Extension<Channel>,
    Path(message_id): Path<String>
) -> Result<String, crate::Error> {
    let message = sqlx::query!("SELECT id FROM messages WHERE id = $1;", message_id).fetch_optional(&state.pg).await?;
    if let Some(message) = message {
        sqlx::query!("UPDATE read_states SET last_message_id = $1 WHERE channel_id = $2 AND user_id = $3;", message.id, channel.id, account.id).execute(&state.pg).await?;
        Ok("".to_string())
    } else {
        Err(crate::Error::MessageNotFound)
    }
}