use argon2::{PasswordHasher, password_hash::{rand_core::OsRng, SaltString}};
use axum::{extract::State, http::{StatusCode, Response}, Json};
use cf_turnstile::SiteVerifyRequest;
use lettre::{message::{header::ContentType, Mailbox}, Message, Transport};
use rand::random_range;
use serde::Deserialize;
use serde_valid::Validate;

#[derive(Deserialize, Validate)]
pub struct RequestData {
    email: String,

    cf_response: Option<String>
}

#[derive(Deserialize, Validate)]
pub struct ResetData {
    email: String,
    code: i32,
    new_password: String,

    cf_response: Option<String>
}

pub async fn request(
    State(state): State<crate::State>,
    Json(model): Json<RequestData>,
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
                return Err(crate::Error::CaptchaFailed);
            }
        }
        _ => {}
    }

    let email = model.email.to_lowercase();
    let check_exist = sqlx::query!("SELECT id FROM accounts WHERE email = $1;", email)
        .fetch_optional(&state.pg)
        .await?;

    if check_exist.is_none() {
        return Ok(
            Response::builder()
                .status(StatusCode::NO_CONTENT)
                .body("".to_string())
                .unwrap()
        );
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
    email_ttl.insert(format!("{}-reset", model.email.clone()), code);
    drop(email_ttl);

    match state.mailer {
        Some(mailer) => {
            let email = Message::builder()
                .from(from)
                .to(to)
                .subject("Your password reset code")
                .header(ContentType::TEXT_PLAIN)
                .body(format!("Use this code: {} to reset your account's password.", code))
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

pub async fn reset(
    State(state): State<crate::State>,
    Json(model): Json<ResetData>,
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
                return Err(crate::Error::CaptchaFailed);
            }
        }
        _ => {}
    }

    let email = model.email.to_lowercase();
    let check_exist = sqlx::query!("SELECT id FROM accounts WHERE email = $1;", email)
        .fetch_optional(&state.pg)
        .await?;

    if check_exist.is_none() {
        return Ok(
            Response::builder()
                .status(StatusCode::NO_CONTENT)
                .body("".to_string())
                .unwrap()
        );
    }

    let email_ttl = state.email_ttl.read().await;
    
    match email_ttl.get_raw(&format!("{}-reset", model.email.clone())) {
        Some(code) => {
            if *code != model.code {
                return Err(crate::Error::InvalidCode);
            }

            drop(email_ttl);
            let mut email_ttl = state.email_ttl.write().await;
            email_ttl.remove(&format!("{}-reset", model.email.clone()));
            drop(email_ttl);

            let from = Mailbox::new(
                Some("Derailed".to_owned()), 
                "no-reply@derailed.top".parse().unwrap()
            );
            let to = Mailbox::new(
                None, 
                model.email.parse().unwrap()
            );
            
            match state.mailer {
                Some(mailer) => {
                    let email = Message::builder()
                        .from(from)
                        .to(to)
                        .subject("Your password was changed")
                        .header(ContentType::TEXT_PLAIN)
                        .body("Your account's password was changed.".to_string())
                        .unwrap();

                    mailer.send(&email)?;
                },
                _ => {}
            }

            let pw_hash = state
                .password_hasher
                .hash_password(model.new_password.as_bytes(), &SaltString::generate(&mut OsRng))
                .map_err(|_| crate::Error::ArgonError)?
                .to_string();

            sqlx::query!("UPDATE accounts SET password = $1 WHERE email = $2;", pw_hash, email)
                .execute(&state.pg)
                .await?;

        },
        _ => {
            return Ok(
                Response::builder()
                    .status(StatusCode::NO_CONTENT)
                    .body("".to_string())
                    .unwrap()
            );
        }
    }

    Ok(
        Response::builder()
            .status(StatusCode::NO_CONTENT)
            .body("".to_string())
            .unwrap()
    )
}