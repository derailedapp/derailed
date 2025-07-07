use axum::{middleware, routing::post};

mod email;
mod login;
mod register;
mod reset;
pub(crate) mod modify;

pub fn router(state: crate::State) -> axum::Router<crate::State> {
    axum::Router::new()
        .route("/register", post(register::route))
        .route("/login", post(login::route))
        .route("/verify-email", post(email::route))
        .route("/forgot/request", post(reset::request))
        .route("/forgot/reset", post(reset::reset))
        .nest(
            "/accounts/@me", 
            axum::Router::new()
                .route("/change-username", post(modify::change_username))
                .route("/change-password", post(modify::change_password))
                .route("/change-email/request", post(modify::request_email_change))
                .route("/change-email/confirm", post(modify::confirm_email_change))
                .route_layer(middleware::from_fn_with_state(
                    state.clone(),
                    crate::utils::middleware::auth_middleware,
                ))
        )
}
