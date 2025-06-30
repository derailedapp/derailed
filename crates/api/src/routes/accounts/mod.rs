use axum::routing::post;

mod email;
mod login;
mod register;
mod reset;

pub fn router() -> axum::Router<crate::State> {
    axum::Router::new()
        .route("/register", post(register::route))
        .route("/login", post(login::route))
        //.route("/verify-email", post(email::route))
        .route("/forgot/request", post(reset::request))
        .route("/forgot/reset", post(reset::reset))
}
