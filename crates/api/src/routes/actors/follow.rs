use axum::{
    Extension,
    extract::{Path, State},
};
use models::{
    channels::Channel,
    users::{Account, UserActor},
};
use rt_actors::message::{Dispatch, Relationship};
use ulid::Ulid;

use crate::utils::publishing::publish_to;

// 0: following
// 1: followed by
// 2: friends
// 3: blocking
// 4: blocked by
pub async fn route(
    state: State<crate::State>,
    Extension(account): Extension<Account>,
    Path(username): Path<String>,
) -> Result<String, crate::Error> {
    let other_user = sqlx::query_as!(
        UserActor,
        "SELECT * FROM actors WHERE lower(username) = $1;",
        username.to_lowercase()
    )
    .fetch_optional(&state.pg)
    .await?;
    if let Some(other_user) = other_user {
        let relationship = sqlx::query!(
            "SELECT * FROM relationships WHERE user_id = $1 AND target_user_id = $2",
            account.id,
            other_user.id
        )
        .fetch_optional(&state.pg)
        .await?;
        let current_actor =
            sqlx::query_as!(UserActor, "SELECT * FROM actors WHERE id = $1;", account.id)
                .fetch_one(&state.pg)
                .await?;
        let mut txn = state.pg.begin().await?;
        if let Some(rel) = relationship {
            if [3, 4].contains(&rel.r#type) {
                return Err(crate::Error::ActorBlocked);
            } else if rel.r#type == 2 {
                return Err(crate::Error::AlreadyFollowed);
            } else {
                sqlx::query!("UPDATE relationships SET type = $1 WHERE user_id = $2 AND target_user_id = $3;", 2, account.id, other_user.id).execute(&mut *txn).await?;
                sqlx::query!("UPDATE relationships SET type = $1 WHERE user_id = $2 AND target_user_id = $3;", 2, other_user.id, account.id).execute(&mut *txn).await?;

                publish_to(
                    &account.id,
                    Dispatch::RelationshipUpdate(Relationship {
                        r#type: 2,
                        target: other_user.clone(),
                    }),
                )
                .await?;
                publish_to(
                    &other_user.id,
                    Dispatch::RelationshipUpdate(Relationship {
                        r#type: 2,
                        target: current_actor,
                    }),
                )
                .await?;

                let channel_exists = sqlx::query!("SELECT id FROM channels WHERE id IN (SELECT channel_id FROM channel_members WHERE user_id = $1 UNION SELECT channel_id FROM channel_members WHERE user_id = $2) AND type = 0", account.id, other_user.id).fetch_optional(&state.pg).await?;

                if channel_exists.is_none() {
                    let channel = sqlx::query_as!(
                        Channel,
                        "INSERT INTO channels (id, type) VALUES ($1, $2) RETURNING *;",
                        Ulid::new().to_string(),
                        0
                    )
                    .fetch_one(&mut *txn)
                    .await?;
                    sqlx::query!(
                        "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2);",
                        channel.id,
                        account.id
                    )
                    .execute(&mut *txn)
                    .await?;
                    sqlx::query!(
                        "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2);",
                        channel.id,
                        other_user.id
                    )
                    .execute(&mut *txn)
                    .await?;
                    publish_to(&account.id, Dispatch::ChannelCreate(channel.clone())).await?;
                    publish_to(&other_user.id, Dispatch::ChannelCreate(channel)).await?;
                }
            }
        } else {
            sqlx::query!(
                "INSERT INTO relationships (type, user_id, target_user_id) VALUES ($1, $2, $3);",
                0,
                account.id,
                other_user.id
            )
            .execute(&mut *txn)
            .await?;
            sqlx::query!(
                "INSERT INTO relationships (type, user_id, target_user_id) VALUES ($1, $2, $3);",
                1,
                other_user.id,
                account.id
            )
            .execute(&mut *txn)
            .await?;
            publish_to(
                &account.id,
                Dispatch::RelationshipUpdate(Relationship {
                    r#type: 2,
                    target: other_user.clone(),
                }),
            )
            .await?;
            publish_to(
                &other_user.id,
                Dispatch::RelationshipUpdate(Relationship {
                    r#type: 2,
                    target: current_actor,
                }),
            )
            .await?;
        }
        txn.commit().await?;
        Ok("".to_string())
    } else {
        Err(crate::Error::ActorNotFound)
    }
}
