use std::time::{SystemTime, UNIX_EPOCH};

use argon2::password_hash::{PasswordHasher, SaltString, rand_core::OsRng};
use axum::{Json, extract::State};
use base64::{Engine, prelude::BASE64_STANDARD};
use models::users::Account;
use rand::Rng;
use serde::{Deserialize, Serialize};
use serde_valid::Validate;
use sha2::Digest;

#[derive(Deserialize, Validate)]
pub struct RegisterData {
    #[validate(min_length = 5)]
    email: String,
    #[validate(min_length = 4)]
    username: String,
    password: String,
}

#[derive(Serialize)]
pub struct TokenData {
    token: String,
}

pub async fn route(
    State(state): State<crate::State>,
    Json(model): Json<RegisterData>,
) -> Result<Json<TokenData>, crate::Error> {
    if !email_address::EmailAddress::is_valid(&model.email) {
        return Err(crate::Error::InvalidEmail);
    }

    let email = model.email.to_lowercase();
    let check_exist = sqlx::query!("SELECT id FROM accounts WHERE email = $1;", email)
        .fetch_optional(&state.pg)
        .await?;

    if check_exist.is_some() {
        return Err(crate::Error::EmailAlreadyUsed);
    }

    let mut txn = state.pg.begin().await?;

    let pw_hash = state
        .password_hasher
        .hash_password(model.password.as_bytes(), &SaltString::generate(&mut OsRng))
        .map_err(|_| crate::Error::ArgonError)?
        .to_string();
    let account = sqlx::query_as!(
        Account,
        "INSERT INTO accounts (id, email, password, flags) VALUES ($1, $2, $3, $4) RETURNING *;",
        ulid::Ulid::new().to_string(),
        model.email,
        pw_hash,
        0
    )
    .fetch_one(&mut *txn)
    .await?;
    // TODO: return specialized error if username is taken
    sqlx::query!(
        "INSERT INTO actors (id, username, flags) VALUES ($1, $2, $3);",
        account.id,
        model.username,
        0
    )
    .execute(&mut *txn)
    .await?;

    let token = BASE64_STANDARD.encode(rand::rng().random::<[u8; 16]>());
    let session_id = hex::encode(sha2::Sha256::digest(token.as_bytes()));
    let start = SystemTime::now();
    let now = start.duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
    sqlx::query!(
        "INSERT INTO sessions (id, account_id, expires_at, last_usage) VALUES ($1, $2, $3, $4);",
        session_id,
        account.id,
        now + 2_592_000,
        now
    )
    .execute(&mut *txn)
    .await?;

    txn.commit().await?;

    Ok(Json(TokenData { token }))
}
