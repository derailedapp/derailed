use argon2::{
    PasswordHasher,
    password_hash::{SaltString, rand_core::OsRng},
};
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
pub struct RequestData {
    email: String,

    cf_response: Option<String>,
}

#[derive(Deserialize, Validate)]
pub struct ResetData {
    email: String,
    code: i32,
    new_password: String,

    cf_response: Option<String>,
}

pub async fn request(
    State(state): State<crate::State>,
    Json(model): Json<RequestData>,
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

    if check_exist.is_none() {
        return Ok(Response::builder()
            .status(StatusCode::NO_CONTENT)
            .body("".to_string())
            .unwrap());
    }

    let from = Mailbox::new(
        Some("Derailed".to_owned()),
        "no-reply@derailed.top".parse().unwrap(),
    );
    let to = Mailbox::new(None, model.email.parse().unwrap());

    let code = random_range(111111..999999);

    state.otp.push(format!("{}-reset", model.email.clone()), code);

    match state.mailer {
        Some(mailer) => {
            let email = Message::builder()
                .from(from)
                .to(to)
                .subject("Your password reset code")
                .header(ContentType::TEXT_PLAIN)
                .body(format!(
                    "Use this code: {code} to reset your account's password."
                ))
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

pub async fn reset(
    State(state): State<crate::State>,
    Json(model): Json<ResetData>,
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

    if check_exist.is_none() {
        return Ok(Response::builder()
            .status(StatusCode::NO_CONTENT)
            .body("".to_string())
            .unwrap());
    }

    match state.otp.get(&format!("{}-reset", model.email.clone())) {
        Some(code) => {
            if code != model.code {
                return Err(crate::Error::InvalidCode);
            }

            state.otp.remove(&format!("{}-reset", model.email.clone()));

            let from = Mailbox::new(
                Some("Derailed".to_owned()),
                "no-reply@derailed.top".parse().unwrap(),
            );
            let to = Mailbox::new(None, model.email.parse().unwrap());

            if let Some(mailer) = state.mailer {
                let email = Message::builder()
                    .from(from)
                    .to(to)
                    .subject("Your password was changed")
                    .header(ContentType::TEXT_PLAIN)
                    .body("Your account's password was changed.".to_string())
                    .unwrap();

                mailer.send(&email)?;
            }

            let pw_hash = state
                .password_hasher
                .hash_password(
                    model.new_password.as_bytes(),
                    &SaltString::generate(&mut OsRng),
                )
                .map_err(|_| crate::Error::ArgonError)?
                .to_string();

            sqlx::query!(
                "UPDATE accounts SET password = $1 WHERE email = $2;",
                pw_hash,
                email
            )
            .execute(&state.pg)
            .await?;
        }
        _ => {
            return Ok(Response::builder()
                .status(StatusCode::NO_CONTENT)
                .body("".to_string())
                .unwrap());
        }
    }

    Ok(Response::builder()
        .status(StatusCode::NO_CONTENT)
        .body("".to_string())
        .unwrap())
}
