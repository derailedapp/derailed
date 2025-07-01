use models::{
    channels::Channel,
    messages::ReadState,
    users::{Account, UserActor},
};
use serde::Serialize;

/// Represents a communication between actors
pub enum Message {
    Publish(Dispatch),

    // session-specific
    Resume(tokio::sync::mpsc::UnboundedSender<Dispatch>),
    WSClose,
}

#[derive(Debug, Clone, Serialize)]
pub struct RTChannel {
    pub channel: Channel,
    pub members: Vec<models::users::UserActor>,
    pub read_state: ReadState,
}

#[derive(Debug, Clone, Serialize)]
pub struct Relationship {
    pub r#type: i32,
    pub target: models::users::UserActor,
}

/// Represents a communication between actors and user websockets.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "t", content = "d")]
pub enum Dispatch {
    Ready {
        session_id: String,
        channels: Vec<RTChannel>,
        actor: UserActor,
        account: Account,
        relationships: Vec<Relationship>,
    },
    ChannelCreate(models::channels::Channel),
    MessageCreate(models::messages::Message),
    RelationshipUpdate(Relationship),
    WSClose,
}
