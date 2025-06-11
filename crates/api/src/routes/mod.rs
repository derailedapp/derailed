mod accounts;
mod actors;

pub fn router(state: crate::State) -> axum::Router<crate::State> {
    axum::Router::new()
        .merge(accounts::router())
        .merge(actors::router(state))
}
