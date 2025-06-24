use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct Message {
    pub id: String,
    pub author_id: String,
    pub content: String,
    pub channel_id: String,
    pub created_at: i64,
    pub last_modified_at: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ReadState {
    pub user_id: String,
    pub channel_id: String,
    pub last_message_id: String,
    pub mentions: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct MessageMention {
    pub message_id: String,
    pub channel_id: String,
    pub user_id: String,
}
