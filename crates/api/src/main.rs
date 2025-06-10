use std::time::Duration;

use aws_sdk_s3 as s3;
use axum::http::{HeaderValue, Method};
use sqlx::{PgPool, postgres::PgPoolOptions};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

mod routes;

#[derive(Debug, Clone)]
pub struct State {
    pub pg: PgPool,
    pub s3_client: s3::Client,
    pub password_hasher: argon2::Argon2<'static>,
}

#[derive(Debug, thiserror::Error, axum_thiserror::ErrorStatus)]
pub enum Error {
    #[status(400)]
    #[error("Invalid email")]
    InvalidEmail,
    #[status(400)]
    #[error("Email already used")]
    EmailAlreadyUsed,
    #[status(401)]
    #[error("Invalid email or password")]
    InvalidLoginDetails,

    // Internal Errors
    #[status(500)]
    #[error("Internal Service Error")]
    DatabaseError(#[from] sqlx::Error),
    #[status(500)]
    #[error("Internal Service Error")]
    ArgonError,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().unwrap();

    let db_connection_str = std::env::var("DATABASE_URL").unwrap();

    let config = aws_config::load_from_env().await;
    let s3_client = s3::Client::new(&config);

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&db_connection_str)
        .await
        .expect("can't connect to database");

    let origins: Vec<HeaderValue> = std::env::var("ALLOW_ORIGINS")
        .unwrap_or("".to_string())
        .split(",")
        .collect::<Vec<&str>>()
        .iter()
        .map(|url| url.parse().unwrap())
        .collect();
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::PATCH])
        .allow_headers(Any)
        .allow_origin(origins);

    let app = axum::Router::new()
        .merge(routes::router())
        .layer(cors)
        .with_state(State {
            pg: pool,
            s3_client,
            password_hasher: argon2::Argon2::default(),
        });

    let listener = TcpListener::bind("0.0.0.0:24650").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
