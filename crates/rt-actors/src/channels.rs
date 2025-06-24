use models::users::UserActor;
use ractor::{
    Actor, ActorProcessingErr, ActorRef, RpcReplyPort, async_trait, concurrency::Duration, pg,
    rpc::call,
};

use crate::message::Message;

pub struct PrivateChannel;

#[derive(Debug)]
pub struct State {
    pub channel_id: String,
    pub members: Vec<UserActor>,
}

#[derive(Debug)]
pub struct Args {
    pub channel_id: String,
    // this isn't loaded in pre_start since it should be stateless
    pub members: Vec<UserActor>,
}

#[async_trait]
impl Actor for PrivateChannel {
    type Msg = crate::message::Message;
    type State = State;
    type Arguments = Args;

    async fn pre_start(
        &self,
        myself: ActorRef<Self::Msg>,
        args: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        for member in args.members.iter() {
            pg::monitor(member.id.clone() + "-updates", myself.get_cell());
            pg::monitor(member.id.clone() + "-presence", myself.get_cell());
        }
        Ok(State {
            channel_id: args.channel_id,
            members: args.members,
        })
    }

    async fn handle(
        &self,
        _myself: ActorRef<Self::Msg>,
        message: Self::Msg,
        state: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match message {
            crate::message::Message::Publish(dispatch) => {
                let subscribers = pg::get_members(&state.channel_id);
                for subscriber in subscribers.iter() {
                    // TODO: don't clone
                    call(
                        subscriber,
                        |_: RpcReplyPort<()>| Message::Publish(dispatch.clone()),
                        Some(Duration::from_secs(3)),
                    )
                    .await?;
                }
                Ok(())
            }
            _ => Ok(()),
        }
    }
}
