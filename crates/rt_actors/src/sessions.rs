use queues::{IsQueue, Queue};
use ractor::{Actor, ActorProcessingErr, ActorRef, RpcReplyPort, async_trait, pg, rpc::call};

use crate::message::Dispatch;

pub struct Session;

#[derive(Debug)]
pub struct State {
    pub session_id: String,
    pub user_id: String,
    ws_is_closed: bool,
    queue: Option<queues::Queue<Dispatch>>,
    ws: Option<tokio::sync::mpsc::UnboundedSender<crate::message::Dispatch>>,
}

#[derive(Debug)]
pub struct Args {
    pub user_id: String,
    pub session_id: String,
    pub joined_guilds: Vec<String>,
    pub joined_channels: Vec<String>,
    pub ws: tokio::sync::mpsc::UnboundedSender<crate::message::Dispatch>,
}

#[async_trait]
impl Actor for Session {
    type Msg = crate::message::Message;
    type State = State;
    type Arguments = Args;

    async fn pre_start(
        &self,
        myself: ActorRef<Self::Msg>,
        args: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        // subscribe to the necessary process groups

        pg::monitor(args.session_id.clone(), myself.get_cell());

        // the current users groups
        pg::monitor(args.user_id.clone(), myself.get_cell());
        pg::monitor(args.user_id.clone() + "-updates", myself.get_cell());
        pg::monitor(args.user_id.clone() + "-presence", myself.get_cell());

        // guilds and channels
        args.joined_channels
            .into_iter()
            .for_each(|id| pg::monitor(id, myself.get_cell()));
        args.joined_guilds
            .into_iter()
            .for_each(|id| pg::monitor(id, myself.get_cell()));

        Ok(State {
            session_id: args.session_id,
            user_id: args.user_id,
            ws: Some(args.ws),
            ws_is_closed: false,
            queue: None,
        })
    }

    async fn handle(
        &self,
        myself: ActorRef<Self::Msg>,
        message: Self::Msg,
        state: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match message {
            crate::message::Message::Publish(dispatch) => {
                if let Some(ws) = &state.ws {
                    if ws.send(dispatch).is_err() {
                        call(
                            &myself,
                            |_: RpcReplyPort<()>| crate::message::Message::WSClose,
                            None,
                        )
                        .await?;
                    }
                } else if let Some(queue) = &mut state.queue {
                    queue.add(dispatch)?;
                }
                Ok(())
            }
            crate::message::Message::WSClose => {
                state.queue = Some(Queue::new());
                state.ws_is_closed = true;
                Ok(())
            }
            crate::message::Message::Resume(ws) => {
                if let Some(queue) = &mut state.queue {
                    while queue.size() != 0 {
                        ws.send(queue.remove()?)?;
                    }
                    state.queue = None;
                }
                state.ws = Some(ws);
                // TODO: error if ws is not closed
                state.ws_is_closed = false;
                Ok(())
            }
        }
    }
}
