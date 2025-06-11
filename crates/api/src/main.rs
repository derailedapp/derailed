use std::time::Duration;

use minio::s3::{self, creds::StaticProvider, http::BaseUrl};

use axum::http::{HeaderValue, Method};
use sqlx::{PgPool, postgres::PgPoolOptions};
use sqlxmq::JobRegistry;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

mod routes;
mod utils;

#[derive(Debug, Clone)]
pub struct State {
    pub pg: PgPool,
    pub s3_client: s3::Client,
    pub password_hasher: argon2::Argon2<'static>,
}

#[derive(Debug, thiserror::Error, axum_thiserror::ErrorStatus)]
pub enum Error {
    // Login/Register Errors
    #[status(400)]
    #[error("Invalid email")]
    InvalidEmail,
    #[status(400)]
    #[error("Email already used")]
    EmailAlreadyUsed,
    #[status(401)]
    #[error("Invalid email or password")]
    InvalidLoginDetails,
    #[status(400)]
    #[error("Username already used")]
    UsernameAlreadyUsed,
    #[status(422)]
    #[error("Username contains illegal characters")]
    UsernameTestFail,

    // Actor Errors
    #[status(400)]
    #[error("Error parsing multipart request")]
    FieldIncorrect,
    #[status(400)]
    #[error("Error while parsing image")]
    ImageErrors(#[from] zune_image::errors::ImageErrors),

    // Middleware Errors
    #[status(401)]
    #[error("Given token is not valid")]
    TokenInvalid,
    #[status(400)]
    #[error("This endpoint requires authentication")]
    RequiresAuth,

    // Internal Errors
    #[status(500)]
    #[error("Internal Service Error")]
    DatabaseError(#[from] sqlx::Error),
    #[status(500)]
    #[error("Internal Service Error")]
    ArgonError,
    #[status(500)]
    #[error("Internal Service Error")]
    S3Error(#[from] minio::s3::error::Error),
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().unwrap();

    let db_connection_str = std::env::var("DATABASE_URL").unwrap();

    let s3_endpoint: BaseUrl = std::env::var("S3_ENDPOINT").unwrap().parse().unwrap();
    let creds = StaticProvider::new(
        &std::env::var("S3_ACCESS_KEY").unwrap(),
        &std::env::var("S3_SECRET_KEY").unwrap(),
        None,
    );

    let s3_client = s3::Client::new(s3_endpoint, Some(Box::new(creds)), None, None)
        .expect("Failed to connect to S3");

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

    let mut registry = JobRegistry::new(&[]);
    let runner = registry.runner(&pool).run().await?;

    let state = State {
        pg: pool,
        s3_client,
        password_hasher: argon2::Argon2::default(),
    };

    let app = axum::Router::new()
        .merge(routes::router(state.clone()))
        .layer(cors)
        .with_state(state);

    let listener = TcpListener::bind("0.0.0.0:24650").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
