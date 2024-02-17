import { Message } from "derailed.js";
import { getState } from "../lib/state";
import { observer } from "mobx-react-lite"
import moment from "moment"

interface MessageProps {
    message: Message
}

export default observer((props: MessageProps) => {
    const state = getState()

    return (
        <li className="flex font-primary m-2 p-2 snap-start justify-items-center hover:bg-[#ffc0cb] hover:rounded-2xl">
            <div className="w-10 h-10 bg-blue-500 rounded-full" />
            <div className="flex flex-col pl-5">
                <div className="flex justify-center gap-2">
                    <div className="text-[#161618] font-bold m-auto">
                        {props.message.author.display_name || props.message.author.username}
                    </div>
                    <div className="text-gray-600 font-bold text-xs m-auto">
                        {moment(props.message.timestamp).calendar()}
                    </div>
                </div>
                <div>
                    {props.message.content}
                </div>
            </div>
        </li>
    )
})