use axum::{extract::State, http::{StatusCode, Response}, Json};
use cf_turnstile::SiteVerifyRequest;
use lettre::{message::{header::ContentType, Mailbox}, Message, Transport};
use rand::random_range;
use serde::Deserialize;
use serde_valid::Validate;

#[derive(Deserialize, Validate)]
pub struct VerifyData {
    #[validate(min_length = 5)]
    email: String,

    cf_response: Option<String>
}

pub async fn route(
    State(state): State<crate::State>,
    Json(model): Json<VerifyData>,
) -> Result<Response<String>, crate::Error> {
    if !email_address::EmailAddress::is_valid(&model.email) {
        return Err(crate::Error::InvalidEmail);
    }

    match state.captcha {
        Some(captcha) => {
            let response = model.cf_response.ok_or(crate::Error::CaptchaRequired)?;

            let cf = captcha.siteverify(SiteVerifyRequest {
                response,
                ..Default::default()
            }).await?;

            if !cf.success {
                return Err(crate::Error::CaptchaFailed)
            }
        }
        _ => {}
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
        "no-reply@derailed.top".parse().unwrap()
    );
    let to = Mailbox::new(
        None, 
        model.email.parse().unwrap()
    );

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
                .body(format!("Use this code: {} to verify your account.", code))
                .unwrap();

            mailer.send(&email)?;
        },
        None => {
            println!("{code}");
        }
    }

    Ok(
        Response::builder()
            .status(StatusCode::NO_CONTENT)
            .body("".to_string())
            .unwrap()
    )
}
