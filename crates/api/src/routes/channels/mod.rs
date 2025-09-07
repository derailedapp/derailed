use axum::{middleware, routing::{delete, post}};
use tower::ServiceBuilder;

pub fn router(state: crate::State) -> axum::Router<crate::State> {
    axum::Router::new()
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
