use axum::{Extension, Json, extract::State};
use lettre::{message::{header::ContentType, Mailbox}, Message, Transport};
use models::users::{Account, UserActor};
use rand::random_range;
use rt_actors::message::Dispatch;
use serde::Deserialize;
use serde_valid::Validate;
use argon2::{password_hash::{rand_core::OsRng, PasswordHasher, SaltString}, PasswordHash, PasswordVerifier};

use crate::utils::publishing::publish_group;

#[derive(Deserialize, Validate)]
pub struct UsernameData {
    #[validate(min_length = 4)]
    #[validate(max_length = 20)]
    username: String,
    password: String
}

#[derive(Deserialize)]
pub struct PasswordData {
    password: String,
    new_password: String
}

#[derive(Deserialize, Validate)]
pub struct EmailChangeData {
    password: String,
    #[validate(min_length = 5)]
    email: String
}

#[derive(Deserialize, Validate)]
pub struct EmailChangeConfirmData {
    code: i32
}

#[derive(Debug, Clone)]
pub struct EmailChange {
    email: String,
    code: i32
}

pub async fn change_username(
    state: State<crate::State>,
    Extension(account): Extension<Account>,
    Json(model): Json<UsernameData>,
) -> Result<Json<UserActor>, crate::Error> {
    if state
        .password_hasher
        .verify_password(
            model.password.as_bytes(),
            &PasswordHash::new(&account.password).map_err(|_| crate::Error::ArgonError)?,
        )
        .is_err() {
            return Err(crate::Error::InvalidLoginDetails)
        }

    let username_re = regex::Regex::new("^[a-z0-9_]+$").unwrap();
    if !username_re.is_match(&model.username) {
        return Err(crate::Error::UsernameTestFail);
    }

    let check_exist = sqlx::query!(
        "SELECT id FROM actors WHERE username = $1;",
        &model.username
    )
    .fetch_optional(&state.pg)
    .await?;

    if check_exist.is_some() {
        return Err(crate::Error::UsernameAlreadyUsed);
    }

    let actor = sqlx::query_as!(
        UserActor,
        "UPDATE actors SET username = $1 WHERE id = $2 RETURNING *;",
        model.username,
        account.id
    )
    .fetch_one(&state.pg)
    .await?;

    publish_group(
        &(account.id + "-updates"),
        Dispatch::ActorUpdate(actor.clone()),
    )
    .await?;


    Ok(Json(actor))
}

pub async fn change_password(
    state: State<crate::State>,
    Extension(account): Extension<Account>,
    Json(model): Json<PasswordData>,
) -> Result<(), crate::Error> {
    if state
        .password_hasher
        .verify_password(
            model.password.as_bytes(),
            &PasswordHash::new(&account.password).map_err(|_| crate::Error::ArgonError)?,
        )
        .is_err() {
            return Err(crate::Error::InvalidLoginDetails)
        }
    
    let new_password = state
        .password_hasher
        .hash_password(model.new_password.as_bytes(), &SaltString::generate(&mut OsRng))
        .map_err(|_| crate::Error::ArgonError)?
        .to_string();

    sqlx::query!(
        "UPDATE accounts SET password = $1 WHERE id = $2;",
        new_password,
        account.id
    )
    .execute(&state.pg)
    .await?;

    let from = Mailbox::new(
        Some("Derailed".to_owned()),
        "no-reply@derailed.top".parse().unwrap(),
    );
    let to = Mailbox::new(None, account.email.parse().unwrap());

    match &state.mailer {
        Some(mailer) => {
            let email = Message::builder()
                .from(from)
                .to(to)
                .subject("Your password was changed")
                .header(ContentType::TEXT_PLAIN)
                .body(format!("Your password was changed"))
                .unwrap();

            mailer.send(&email)?;
        }
        None => {}
    }

    Ok(())
}

pub async fn request_email_change(
    state: State<crate::State>,
    Extension(account): Extension<Account>,
    Json(model): Json<EmailChangeData>,
) -> Result<(), crate::Error> {
    if state
        .password_hasher
        .verify_password(
            model.password.as_bytes(),
            &PasswordHash::new(&account.password).map_err(|_| crate::Error::ArgonError)?,
        )
        .is_err() {
            return Err(crate::Error::InvalidLoginDetails)
        }

    if !email_address::EmailAddress::is_valid(&model.email) {
        return Err(crate::Error::InvalidEmail);
    }
    

    let email = model.email.to_lowercase();
    if email == account.email {
        return Err(crate::Error::SameEmail)
    }

    let check_exist = sqlx::query!("SELECT id FROM accounts WHERE email = $1;", email)
        .fetch_optional(&state.pg)
        .await?;

    if check_exist.is_some() {
        return Err(crate::Error::EmailAlreadyUsed);
    }

    let code = random_range(111111..999999);

    let from = Mailbox::new(
        Some("Derailed".to_owned()),
        "no-reply@derailed.top".parse().unwrap(),
    );
    let to = Mailbox::new(None, email.parse().unwrap());

    match &state.mailer {
        Some(mailer) => {
            let email = Message::builder()
                .from(from)
                .to(to)
                .subject("Your verification code")
                .header(ContentType::TEXT_PLAIN)
                .body(format!("Use this code: {code} to verify your new email."))
                .unwrap();

            mailer.send(&email)?;
        }
        None => {
            println!("{code}");
        }
    }

    state.email_change.push(account.email, EmailChange { email, code });

    Ok(())
}

pub async fn confirm_email_change(
    state: State<crate::State>,
    Extension(account): Extension<Account>,
    Json(model): Json<EmailChangeConfirmData>,
) -> Result<(), crate::Error> {
    let data = match state.email_change.get(&account.email) {
        Some(data) => data,
        None => return Err(crate::Error::NoEmailChange)
    };

    if data.code != model.code {
        return Err(crate::Error::InvalidCode);
    }

    let check_exist = sqlx::query!("SELECT id FROM accounts WHERE email = $1;", data.email)
        .fetch_optional(&state.pg)
        .await?;

    if check_exist.is_some() {
        state.email_change.remove(&account.email);
        return Err(crate::Error::EmailAlreadyUsed);
    }

    let from = Mailbox::new(
        Some("Derailed".to_owned()),
        "no-reply@derailed.top".parse().unwrap(),
    );
    let to = Mailbox::new(None, account.email.parse().unwrap());

    match &state.mailer {
        Some(mailer) => {
            let email = Message::builder()
                .from(from)
                .to(to)
                .subject("Your email was changed")
                .header(ContentType::TEXT_PLAIN)
                .body(format!("Your email was changed to {}.", data.email))
                .unwrap();

            mailer.send(&email)?;
        }
        None => {}
    }

    sqlx::query!(
        "UPDATE accounts SET email = $1 WHERE id = $2;",
        data.email,
        account.id
    )
    .execute(&state.pg)
    .await?;

    state.email_change.remove(&account.email);
    Ok(())
}
