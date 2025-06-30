use axum::{
    Json,
    extract::State,
    http::{Response, StatusCode},
};
use cf_turnstile::SiteVerifyRequest;
use lettre::{
    Message, Transport,
    message::{Mailbox, header::ContentType},
};
use rand::random_range;
use serde::Deserialize;
use serde_valid::Validate;

#[derive(Deserialize, Validate)]
pub struct VerifyData {
    #[validate(min_length = 5)]
    email: String,

    cf_response: Option<String>,
}

pub async fn route(
    State(state): State<crate::State>,
    Json(model): Json<VerifyData>,
) -> Result<Response<String>, crate::Error> {
    if !email_address::EmailAddress::is_valid(&model.email) {
        return Err(crate::Error::InvalidEmail);
    }

    if let Some(captcha) = state.captcha {
        let response = model.cf_response.ok_or(crate::Error::CaptchaRequired)?;

        let cf = captcha
            .siteverify(SiteVerifyRequest {
                response,
                ..Default::default()
            })
            .await?;

        if !cf.success {
            return Err(crate::Error::CaptchaFailed);
        }
    }

    let email = model.email.to_lowercase();
    let check_exist = sqlx::query!("SELECT id FROM accounts WHERE email = $1;", email)
        .fetch_optional(&state.pg)
        .await?;

    if check_exist.is_some() {
        return Err(crate::Error::EmailAlreadyUsed);
    }

    let from = Mailbox::new(
        Some("Derailed".to_owned()),
        "no-reply@derailed.top".parse().unwrap(),
    );
    let to = Mailbox::new(None, model.email.parse().unwrap());

    let code = random_range(111111..999999);

    let mut email_ttl = state.email_ttl.write().await;
    email_ttl.insert(model.email.clone(), code);
    drop(email_ttl);

    match state.mailer {
        Some(mailer) => {
            let email = Message::builder()
                .from(from)
                .to(to)
                .subject("Your verification code")
                .header(ContentType::TEXT_PLAIN)
                .body(format!("Use this code: {code} to verify your account."))
                .unwrap();

            mailer.send(&email)?;
        }
        None => {
            println!("{code}");
        }
    }

    Ok(Response::builder()
        .status(StatusCode::NO_CONTENT)
        .body("".to_string())
        .unwrap())
}
