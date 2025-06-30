use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct Account {
    pub id: String,
    pub email: String,
    pub flags: i64,
    #[serde(skip_serializing)]
    pub password: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Session {
    pub id: String,
    pub account_id: String,
    pub expires_at: i64,
    pub last_usage: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct UserActor {
    pub id: String,
    pub username: String,
    pub display_name: Option<String>,
    pub avatar_id: Option<String>,
    pub banner_id: Option<String>,
    pub flags: i64,
}
