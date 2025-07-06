use axum::{Extension, Json, extract::State};
use models::users::Account;
use rt_actors::message::Dispatch;
use serde::Deserialize;
use serde_valid::Validate;

use crate::utils::publishing::publish_group;

#[derive(Deserialize, Validate)]
pub struct ModifyData {
    #[validate(min_length = 4)]
    #[validate(max_length = 32)]
    display_name: String,
}

pub async fn route(
    State(state): State<crate::State>,
    Extension(account): Extension<Account>,
    Json(model): Json<ModifyData>,
) -> Result<Json<models::users::UserActor>, crate::Error> {
    sqlx::query!(
        "UPDATE actors SET display_name = $1 WHERE id = $2",
        model.display_name,
        account.id
    )
    .execute(&state.pg)
    .await?;

    let actor = sqlx::query_as!(
        models::users::UserActor,
        "SELECT * FROM actors WHERE id = $1",
        account.id
    )
    .fetch_one(&state.pg)
    .await?;

    publish_group(
        &(account.id + "-updates"),
        Dispatch::ActorUpdate(actor.clone()),
    )
    .await?;

    Ok(Json(actor))
}
