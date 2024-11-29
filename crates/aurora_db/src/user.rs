// Copyright (C) 2024 V.J. De Chico
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::{DBError, FromId, FromIdResult};

#[derive(Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub username: String,
    #[sqlx(default)]
    pub display_name: Option<String>,
    #[sqlx(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[sqlx(default)]
    #[serde(skip_serializing)]
    pub password: Option<String>,
    #[sqlx(default)]
    pub flags: Option<i32>,
    #[sqlx(default)]
    pub server_id: Option<String>,
}

impl FromId<String> for User {
    async fn from_id(db: &sqlx::PgPool, id: String) -> FromIdResult<Self> {
        sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1;", id)
            .fetch_one(db)
            .await
            .map_err(|_| DBError::RowNotFound)
    }
}