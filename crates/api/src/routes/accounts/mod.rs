use axum::routing::post;

mod login;
mod register;

pub fn router() -> axum::Router<crate::State> {
    axum::Router::new()
        .route("/register", post(register::route))
        .route("/login", post(login::route))
}
