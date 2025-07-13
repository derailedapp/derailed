use axum::{middleware, routing::post};
use tower::ServiceBuilder;
mod create;
mod list;
mod delete;

pub fn router(state: crate::State) -> axum::Router<crate::State> {
    axum::Router::new()
        .route(
            "/channels/{channel_id}/messages",
            post(create::route).get(list::route),
        )
        .layer(
            ServiceBuilder::new()
                .layer(middleware::from_fn_with_state(
                    state.clone(),
                    crate::utils::middleware::auth_middleware,
                ))
                .layer(middleware::from_fn_with_state(
                    state.clone(),
                    crate::utils::middleware::channel_middleware,
                )),
        )
}
