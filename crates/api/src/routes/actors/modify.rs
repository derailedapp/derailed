use axum::{Extension, Json, extract::State};
use models::users::Account;
use rt_actors::message::Dispatch;
use serde::Deserialize;
use serde_valid::Validate;

use crate::utils::publishing::publish_to;

#[derive(Deserialize, Validate)]
pub struct ModifyData {
    #[validate(min_length = 4)]
    #[validate(max_length = 32)]
    username: Option<String>,
    display_name: Option<String>,
}

pub async fn route(
    State(state): State<crate::State>,
    Extension(account): Extension<Account>,
    Json(model): Json<ModifyData>,
) -> Result<Json<models::users::UserActor>, crate::Error> {
    let mut txn = state.pg.begin().await?;

    if let Some(display_name) = model.display_name {
        sqlx::query!(
            "UPDATE actors SET display_name = $1 WHERE id = $2",
            display_name,
            account.id
        )
        .execute(&mut *txn)
        .await?;
    }

    if let Some(username) = model.username {
        if sqlx::query!("SELECT id FROM actors WHERE username = $1", &username)
            .fetch_optional(&state.pg)
            .await?
            .is_some()
        {
            return Err(crate::Error::UsernameAlreadyUsed);
        }

        let username_re = regex::Regex::new("^[a-z0-9_]+$").unwrap();
        if !username_re.is_match(&username) {
            return Err(crate::Error::UsernameTestFail);
        }

        sqlx::query!(
            "UPDATE actors SET username = $1 WHERE id = $2",
            username,
            account.id
        )
        .execute(&mut *txn)
        .await?;
    }

    txn.commit().await?;

    let actor = sqlx::query_as!(
        models::users::UserActor,
        "SELECT * FROM actors WHERE id = $1",
        account.id
    )
    .fetch_one(&state.pg)
    .await?;

    let channels = sqlx::query!(
        "SELECT id FROM channels WHERE id IN (SELECT channel_id FROM channel_members WHERE user_id = $1);",
        account.id
    )
    .fetch_all(&state.pg)
    .await?;

    for channel in channels {
        publish_to(&channel.id, Dispatch::ActorUpdate(actor.clone())).await?;
    }

    Ok(Json(actor))
}
