import { getState } from "../lib/state";
import { observer } from "mobx-react-lite"
import Message from "./Message";

interface ChannelProps {
    channelId: BigInt
}

const ChannelInput = observer((props: ChannelProps) => {
    return (
        <div className="m-5 bg-[#ffc0cb] w-full text-black rounded-3xl">
            Afnawfnuwniofnaiwnfiwn
        </div>
    )
})

export default observer((props: ChannelProps) => {
    const state = getState()

    return (
        <main className="bg-[#e8a7b2] w-full max-h-full m-4 rounded-lg overflow-y-hidden">
            <ol className="flex scrollbar h-full overflow-y-scroll flex-col-reverse">
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
                <Message message={{id: BigInt(1), channel_id: BigInt(1), author: state.cache.user!, content: "you're uncool", timestamp: "2024-01-25T12:48:15+0000", edited_timestamp: null, referenced_message_id: null}} />
            </ol>
            <ChannelInput channelId={props.channelId} />
        </main>
    )
})