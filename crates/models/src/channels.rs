use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct Channel {
    pub id: String,
    pub r#type: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct ChannelMember {
    pub channel_id: String,
    pub user_id: String,
}
