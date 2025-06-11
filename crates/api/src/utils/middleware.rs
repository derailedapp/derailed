use axum::{
    extract::{Request, State}, 
    middleware::Next, response::Response
};

use sha2::Digest;

pub async fn auth_middleware(
    State(state): State<crate::State>,

    req: Request, 
    next: Next
) -> Result<Response, crate::Error> {
    let (mut parts, body) = req.into_parts();

    let token = parts.headers
        .get("Authorization")
        .ok_or(crate::Error::RequiresAuth)?
        .to_str()
        .map_err(|_| crate::Error::TokenInvalid)?
        .to_owned();

    let token = hex::encode(sha2::Sha256::digest(token.as_bytes()));

    let record = sqlx::query!("SELECT account_id FROM sessions WHERE id = $1;", token)
        .fetch_optional(&state.pg)
        .await?
        .ok_or(crate::Error::TokenInvalid)?;

    parts.extensions.insert(record.account_id);

    let request = Request::from_parts(parts, body);
    Ok(
        next.run(request).await
    )
}
