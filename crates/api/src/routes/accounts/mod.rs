use axum::routing::post;

mod login;
mod register;
mod email;

pub fn router() -> axum::Router<crate::State> {
    axum::Router::new()
        .route("/register", post(register::route))
        .route("/login", post(login::route))
        .route("/verify-email", post(email::route))
}
