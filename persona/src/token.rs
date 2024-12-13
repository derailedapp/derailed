/*
    Copyright 2024 V.J. De Chico

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

use axum::http::HeaderMap;
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

use crate::{
    db::{account::Account, actor::Actor, tent::clean_get_user_db},
    error::Error,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub exp: usize,
    pub iat: usize,
    pub sub: String,
}

impl Claims {
    pub fn make_token(&self, key: &EncodingKey) -> Result<String, Error> {
        Ok(encode(
            &Header::new(jsonwebtoken::Algorithm::HS256),
            self,
            key,
        )?)
    }

    pub fn from_token(token: &str, key: &DecodingKey) -> Result<Self, Error> {
        Ok(decode::<Self>(token, key, &Validation::new(jsonwebtoken::Algorithm::HS256))?.claims)
    }

    pub fn from_token_map(map: &HeaderMap, key: &DecodingKey) -> Result<Self, Error> {
        if let Some(token) = map.get("authorization") {
            Self::from_token(token.to_str()?, key)
        } else {
            Err(Error::BadToken)
        }
    }
}

pub async fn get_user(map: &HeaderMap, key: &str) -> Result<(Actor, Account, SqlitePool), Error> {
    let claims = Claims::from_token_map(map, &DecodingKey::from_secret(key.as_bytes()))?;

    if let Ok(db) = clean_get_user_db(&claims.sub).await {
        if let Some(account) = sqlx::query_as!(
            Account,
            "SELECT * FROM accounts WHERE id IN (SELECT account_id FROM sessions WHERE id = $1);",
            claims.sub
        )
        .fetch_optional(&db)
        .await?
        {
            Ok((
                sqlx::query_as!(Actor, "SELECT * FROM actors WHERE id = $1;", account.id)
                    .fetch_one(&db)
                    .await?,
                account,
                db,
            ))
        } else {
            Err(Error::ExpiredSession)
        }
    } else {
        Err(Error::BadToken)
    }
}
