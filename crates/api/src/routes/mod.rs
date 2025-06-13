mod accounts;
mod actors;
mod messaging;

pub fn router(state: crate::State) -> axum::Router<crate::State> {
    axum::Router::new()
        .merge(accounts::router())
        .merge(actors::router(state.clone()))
        .merge(messaging::router(state.clone()))
}
