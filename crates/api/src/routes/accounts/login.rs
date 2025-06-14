use std::time::{SystemTime, UNIX_EPOCH};

use argon2::{PasswordHash, PasswordVerifier};
use axum::{Json, extract::State};
use base64::{Engine, prelude::BASE64_STANDARD};
use cf_turnstile::SiteVerifyRequest;
use models::users::Account;
use rand::Rng;
use serde::{Deserialize, Serialize};
use serde_valid::Validate;
use sha2::Digest;

#[derive(Deserialize, Validate)]
pub struct LoginData {
    #[validate(min_length = 5)]
    email: String,
    password: String,

    cf_response: Option<String>
}

#[derive(Serialize)]
pub struct TokenData {
    token: String,
}

pub async fn route(
    State(state): State<crate::State>,
    Json(model): Json<LoginData>,
) -> Result<Json<TokenData>, crate::Error> {
    match state.captcha {
        Some(captcha) => {
            let response = model.cf_response.ok_or(crate::Error::CaptchaRequired)?;

            let cf = captcha.siteverify(SiteVerifyRequest {
                response,
                ..Default::default()
            }).await?;

            if !cf.success {
                return Err(crate::Error::CaptchaFailed)
            }
        }
        _ => {}
    }

    let email = model.email.to_lowercase();
    let account = sqlx::query_as!(Account, "SELECT * FROM accounts WHERE email = $1;", email)
        .fetch_optional(&state.pg)
        .await?;

    if let Some(account) = account {
        if state
            .password_hasher
            .verify_password(
                model.password.as_bytes(),
                &PasswordHash::new(&account.password).map_err(|_| crate::Error::ArgonError)?,
            )
            .is_err()
        {
            return Err(crate::Error::InvalidLoginDetails);
        }

        let token = BASE64_STANDARD.encode(rand::rng().random::<[u8; 32]>());
        let session_id = hex::encode(sha2::Sha256::digest(token.as_bytes()));
        let start = SystemTime::now();
        let now = start.duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
        sqlx::query!("INSERT INTO sessions (id, account_id, expires_at, last_usage) VALUES ($1, $2, $3, $4);", session_id, account.id, now + 2_592_000, now).execute(&state.pg).await?;

        Ok(Json(TokenData { token }))
    } else {
        Err(crate::Error::InvalidLoginDetails)
    }
}
