import { getState } from "../lib/state";
import { observer } from "mobx-react-lite"
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react"


interface SidebarProps {
    channelId?: BigInt
}


export default observer((props: SidebarProps) => {
    const state = getState()

    return (
        <ul className="font-primary font-bold h-screen w-1/4 text-[#161618] pt-10 text-3xl flex flex-col overflow-y-hidden justify-items-center gap-2">
            <li key="home">
                <Link to="/channels/@me">
                    <div className="flex justify-center pb-10 justify-items-center m-auto gap-1.5">
                        <Icon icon="material-symbols:home-app-logo" className="text-5xl" />
                    </div>
                </Link>
            </li>
            {state.cache.channels.map((channel, _idx, _arr) => {
                return (
                    <li key={channel.id.toString()}>
                        <Link params={{channelId: channel.id.toString()}} to={`/channels/$channelId`}>
                            <div className="flex flex-wrap gap-1.5 justify-center justify-items-center m-auto" onLoad={(e) => {
                                e.preventDefault()
                                if (channel.id === props.channelId) {
                                    e.currentTarget.classList.add("rounded-xl", "bg-black", "opacity-25")
                                }
                            }}>
                                <div className="flex flex-wrap gap-1.5 justify-center justify-items-center m-auto">
                                    <Icon icon="material-symbols:tag-rounded" className="text-4xl font-bold" />
                                    {channel.name && (
                                        <h5>{channel.name}</h5>
                                    )}
                                    {!channel.name && (
                                        <h5>Unnamed Channel</h5>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
})