use axum::{
    extract::{self, Request, State},
    middleware::Next,
    response::Response,
};

use models::{channels::Channel, users::Account};
use sha2::Digest;

pub async fn auth_middleware(
    State(state): State<crate::State>,

    req: Request,
    next: Next,
) -> Result<Response, crate::Error> {
    let (mut parts, body) = req.into_parts();

    let token = parts
        .headers
        .get("Authorization")
        .ok_or(crate::Error::RequiresAuth)?
        .to_str()
        .map_err(|_| crate::Error::TokenInvalid)?
        .to_owned();

    let token = hex::encode(sha2::Sha256::digest(token.as_bytes()));

    let record = sqlx::query_as!(
        Account,
        "SELECT * FROM accounts WHERE id IN (SELECT account_id FROM sessions WHERE id = $1);",
        token
    )
    .fetch_optional(&state.pg)
    .await?
    .ok_or(crate::Error::TokenInvalid)?;

    parts.extensions.insert(record);

    let request = Request::from_parts(parts, body);
    Ok(next.run(request).await)
}

pub async fn channel_middleware(
    params: extract::RawPathParams,
    State(state): State<crate::State>,

    req: Request,
    next: Next,
) -> Result<Response, crate::Error> {
    let (mut parts, body) = req.into_parts();
    let account = parts.extensions.get::<Account>().unwrap();
    let mut channel_id = None;
    for (k, v) in params.iter() {
        if k == "channel_id" {
            channel_id = Some(v);
            break;
        }
    }

    let record = sqlx::query_as!(Channel, "SELECT * FROM channels WHERE id = $1;", channel_id)
        .fetch_optional(&state.pg)
        .await?
        .ok_or(crate::Error::ChannelNotFound)?;
    if record.r#type == 0 || record.r#type == 1 {
        sqlx::query!(
            "SELECT * FROM channel_members WHERE user_id = $1 AND channel_id = $2",
            account.id,
            record.id
        )
        .fetch_optional(&state.pg)
        .await?
        .ok_or(crate::Error::NoChannelMembership)?;
    }

    parts.extensions.insert(record);

    Ok(next.run(Request::from_parts(parts, body)).await)
}
