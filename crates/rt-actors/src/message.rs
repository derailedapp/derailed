/// Represents a communication between actors
pub enum Message {
    Publish(Dispatch),

    // session-specific
    Resume(tokio::sync::mpsc::UnboundedSender<Dispatch>),
    WSClose,
}

/// Represents a communication between actors and user websockets.
#[derive(Debug, Clone)]
pub enum Dispatch {}
