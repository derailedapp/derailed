use ractor::{RpcReplyPort, pg, rpc::call};
use rt_actors::message::Dispatch;

pub async fn publish_to(id: &String, message: Dispatch) -> Result<(), crate::Error> {
    let sessions = pg::get_members(id);
    for session in sessions.iter() {
        call(session, |_: RpcReplyPort<()>| message.clone(), None).await?;
    }
    Ok(())
}
