use models::{channels::Channel, messages::Message, users::Account};
use axum::{extract::{Path, State}, Extension};

pub async fn route(
    State(state): State<crate::State>,
    Extension(account): Extension<Account>,
    Extension(_): Extension<Channel>,
    Path(message_id): Path<String>
) -> Result<String, crate::Error> {
    let message = sqlx::query_as!(Message, "SELECT * FROM messages WHERE id = $1;", message_id).fetch_optional(&state.pg).await?;
    if let Some(message) = message {
        if message.author_id != account.id {
            return Err(crate::Error::MessageCantDelete);
        }
        sqlx::query!("DELETE FROM messages WHERE id = $1;", message.id).execute(&state.pg).await?;
        Ok("".to_string())
    } else {
        Err(crate::Error::MessageNotFound)
    }
}