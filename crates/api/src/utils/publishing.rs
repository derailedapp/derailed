use ractor::{ActorRef, pg, registry};
use rt_actors::message::{Dispatch, Message};

pub async fn publish_to(id: &String, message: Dispatch) -> Result<(), crate::Error> {
    let actor = registry::where_is(id.clone());
    if let Some(actor) = actor {
        let actor: ActorRef<Message> = actor.into();
        ractor::cast!(actor, Message::Publish(message.clone()))
            .map_err(|_| crate::Error::ActorError)?;
    }
    Ok(())
}

pub async fn publish_group(id: &String, message: Dispatch) -> Result<(), crate::Error> {
    let actors = pg::get_members(id);
    for actor in actors.into_iter() {
        let actor: ActorRef<Message> = actor.into();
        ractor::cast!(actor, Message::Publish(message.clone()))
            .map_err(|_| crate::Error::ActorError)?;
    }
    Ok(())
}
