use models::users::UserActor;
use ractor::{
    Actor, ActorProcessingErr, ActorRef, async_trait, pg,
};

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
        pg::join(args.channel_id.clone(), vec![myself.get_cell()]);
        for member in args.members.iter() {
            pg::join(member.id.clone() + "-updates", vec![myself.get_cell()]);
            pg::join(member.id.clone() + "-presence", vec![myself.get_cell()]);
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
        _state: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        Ok(())
    }
}
