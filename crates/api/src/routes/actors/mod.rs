use axum::{extract::DefaultBodyLimit, middleware, routing::{patch, post}};

mod modify;
mod assets;

pub fn router(state: crate::State) -> axum::Router<crate::State> {
    axum::Router::new()
        .route("/users/@me", patch(modify::route))
        .route("/users/@me/assets", post(assets::route))
        .route_layer(middleware::from_fn_with_state(state.clone(), crate::utils::middleware::auth_middleware))
        .layer(DefaultBodyLimit::max(8 * 1000 * 1000))
}
