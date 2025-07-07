pub(crate) mod accounts;
mod actors;
mod messaging;
mod rt;

pub fn router(state: crate::State) -> axum::Router<crate::State> {
    axum::Router::new()
        .merge(accounts::router(state.clone()))
        .merge(actors::router(state.clone()))
        .merge(messaging::router(state.clone()))
        .merge(rt::router())
}
