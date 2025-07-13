use std::sync::Arc;
use std::time::Duration;

use minio::s3::{self, creds::StaticProvider, http::BaseUrl};

use axum::http::{HeaderValue, Method};
use ractor::MessagingErr;
use sqlx::{PgPool, postgres::PgPoolOptions};
use sqlxmq::JobRegistry;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

use cf_turnstile::TurnstileClient;
use lettre::SmtpTransport;
use lettre::transport::smtp::authentication::Credentials;
use ttl_dashmap::TtlDashmap;

mod routes;
mod utils;

#[derive(Clone)]
pub struct State {
    pub pg: PgPool,
    pub s3_client: s3::Client,
    pub password_hasher: argon2::Argon2<'static>,
    pub mailer: Option<SmtpTransport>,

    pub otp: Arc<TtlDashmap<String, i32>>,
    pub email_change: Arc<TtlDashmap<String, crate::routes::accounts::modify::EmailChange>>,

    pub captcha: Option<Arc<TurnstileClient>>,
    pub alpha_code: String,
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
    #[status(400)]
    #[error("Invalid code")]
    InvalidCode,

    // Actor Errors
    #[status(400)]
    #[error("Error parsing multipart request")]
    FieldIncorrect,
    #[status(400)]
    #[error("Error while parsing image")]
    ImageErrors(#[from] zune_image::errors::ImageErrors),
    #[status(400)]
    #[error("Image is too small, it must be atleast: {0}x{1}")]
    ImageTooSmall(i32, i32),
    #[status(404)]
    #[error("Actor not found")]
    ActorNotFound,
    #[status(400)]
    #[error("Actor is blocked or has blocked you")]
    ActorBlocked,
    #[status(400)]
    #[error("Actor is already followed")]
    AlreadyFollowed,

    // Acccount Modify Errors
    #[status(400)]
    #[error("An email change was never requested or ttl ran out")]
    NoEmailChange,
    #[status(400)]
    #[error("The provided email address is identical to your current one")]
    SameEmail,

    // Channel Errors
    #[status(404)]
    #[error("Channel not found")]
    ChannelNotFound,
    #[status(403)]
    #[error("Account is not a member of this channel")]
    NoChannelMembership,
    #[status(400)]
    #[error("No pagination options given")]
    NoPaginationOptions,

    // Middleware Errors
    #[status(401)]
    #[error("Given token is not valid")]
    TokenInvalid,
    #[status(400)]
    #[error("This endpoint requires authentication")]
    RequiresAuth,

    // RT Errors
    #[status(400)]
    #[error("JSON data is invalid")]
    InvalidJson,
    #[status(400)]
    #[error("Session already identified")]
    AlreadyIdentified,
    #[status(500)]
    #[error("Internal Server Error")]
    ActorError,

    // CF Error
    #[status(400)]
    #[error("Captcha Response Required")]
    CaptchaRequired,
    #[status(400)]
    #[error("Captcha Error")]
    CaptchaError(#[from] cf_turnstile::error::TurnstileError),
    #[status(400)]
    #[error("Captcha Failed")]
    CaptchaFailed,

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
    #[status(500)]
    #[error("Internal Service Error")]
    MessagingError(#[from] MessagingErr<rt_actors::message::Message>),
    #[status(500)]
    #[error("Internal Service Error")]
    SMTPError(#[from] lettre::transport::smtp::Error),
}

#[tokio::main]
async fn main() {
    _ = dotenvy::dotenv();

    let db_connection_str = std::env::var("DATABASE_URL").unwrap();

    let s3_endpoint: BaseUrl = std::env::var("S3_ENDPOINT").unwrap().parse().unwrap();
    let creds = StaticProvider::new(
        &std::env::var("S3_ACCESS_KEY").unwrap(),
        &std::env::var("S3_SECRET_KEY").unwrap(),
        None,
    );

    let s3_client = s3::Client::new(s3_endpoint, Some(Box::new(creds)), None, None)
        .expect("Failed to connect to S3");

    let mailer = match std::env::var("SMTP_HOST") {
        Ok(host) => {
            let email_creds = Credentials::new(
                std::env::var("SMTP_USERNAME").unwrap(),
                std::env::var("SMTP_PASSWORD").unwrap(),
            );

            Some(
                SmtpTransport::starttls_relay(&host)
                    .unwrap()
                    .credentials(email_creds)
                    .build(),
            )
        }
        Err(_) => None,
    };

    let captcha = match std::env::var("CF_SECRET") {
        Ok(secret) => Some(Arc::new(cf_turnstile::TurnstileClient::new(secret.into()))),
        Err(_) => None,
    };

    let alpha_code = std::env::var("ALPHA_CODE").unwrap();

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

    let registry = JobRegistry::new(&[]);
    registry.runner(&pool).run().await.unwrap();

    let state = State {
        pg: pool,
        s3_client,
        password_hasher: argon2::Argon2::default(),
        mailer,
        otp: Arc::new(TtlDashmap::<String, i32>::new(Duration::from_secs(3600))),
        email_change: Arc::new(TtlDashmap::<
            String,
            crate::routes::accounts::modify::EmailChange,
        >::new(Duration::from_secs(600))),
        captcha,
        alpha_code,
    };

    let app = axum::Router::new()
        .merge(routes::router(state.clone()))
        .layer(cors)
        .with_state(state);

    let listener = TcpListener::bind("0.0.0.0:24650").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
