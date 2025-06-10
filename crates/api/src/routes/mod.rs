mod accounts;

pub fn router() -> axum::Router<crate::State> {
    axum::Router::new().merge(accounts::router())
}
