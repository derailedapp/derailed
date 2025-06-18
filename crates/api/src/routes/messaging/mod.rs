use axum::{middleware, routing::post};
mod create;
mod list;

pub fn router(state: crate::State) -> axum::Router<crate::State> {
    axum::Router::new()
        .route(
            "/channels/{channel_id}/messages",
            post(create::route).get(list::route),
        )
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            crate::utils::middleware::auth_middleware,
        ))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            crate::utils::middleware::channel_middleware,
        ))
}
