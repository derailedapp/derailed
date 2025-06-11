use axum::{Extension, Json, extract::State};
use serde::Deserialize;
use serde_valid::Validate;

#[derive(Deserialize, Validate)]
pub struct ModifyData {
    #[validate(min_length = 4)]
    #[validate(max_length = 32)]
    username: Option<String>,
    display_name: Option<String>,
}

pub async fn route(
    State(state): State<crate::State>,
    Extension(account_id): Extension<String>,
    Json(model): Json<ModifyData>,
) -> Result<Json<models::users::UserActor>, crate::Error> {
    let mut txn = state.pg.begin().await?;

    if let Some(display_name) = model.display_name {
        sqlx::query!(
            "UPDATE actors SET display_name = $1 WHERE id = $2",
            display_name,
            account_id
        )
        .execute(&mut *txn)
        .await?;
    }

    if let Some(username) = model.username {
        if let Some(_) = sqlx::query!("SELECT id FROM actors WHERE username = $1", &username)
            .fetch_optional(&state.pg)
            .await?
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
            account_id
        )
        .execute(&mut *txn)
        .await?;
    }

    txn.commit().await?;

    let actor = sqlx::query_as!(
        models::users::UserActor,
        "SELECT * FROM actors WHERE id = $1",
        account_id
    )
    .fetch_one(&state.pg)
    .await?;

    Ok(Json(actor))
}
