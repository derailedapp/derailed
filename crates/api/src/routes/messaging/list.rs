use axum::{
    Extension, Json,
    extract::{Query, State},
};
use models::{channels::Channel, messages::Message, users::Account};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PaginationOptions {
    #[serde(default)]
    after: Option<String>,

    #[serde(default)]
    before: Option<String>,

    #[serde(default)]
    around: Option<String>,
}

pub async fn route(
    State(state): State<crate::State>,
    Extension(_): Extension<Account>,
    Extension(channel): Extension<Channel>,
    Query(opts): Query<PaginationOptions>,
) -> Result<Json<Vec<Message>>, crate::Error> {
    if let Some(id) = opts.around {
        let mut around = sqlx::query_as!(
            Message,
            "SELECT * FROM messages WHERE channel_id = $1 AND id >= $2;",
            channel.id,
            id
        )
        .fetch_all(&state.pg)
        .await?;
        around.extend(
            sqlx::query_as!(
                Message,
                "SELECT * FROM messages WHERE channel_id = $1 AND id < $2;",
                channel.id,
                id
            )
            .fetch_all(&state.pg)
            .await?,
        );
        return Ok(Json(around));
    }
    if let Some(id) = opts.after {
        let after = sqlx::query_as!(
            Message,
            "SELECT * FROM messages WHERE channel_id = $1 AND id > $2;",
            channel.id,
            id
        )
        .fetch_all(&state.pg)
        .await?;
        return Ok(Json(after));
    }
    if let Some(id) = opts.before {
        let before = sqlx::query_as!(
            Message,
            "SELECT * FROM messages WHERE channel_id = $1 AND id < $2;",
            channel.id,
            id
        )
        .fetch_all(&state.pg)
        .await?;
        return Ok(Json(before));
    }
    Err(crate::Error::NoPaginationOptions)
}
