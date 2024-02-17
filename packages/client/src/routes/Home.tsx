import { observer } from "mobx-react-lite"
import { Navigate } from "@tanstack/react-router";
import Sidebar from "../components/Sidebar";
import Channel from "../components/Channel";

export default observer(() => {
    if (!localStorage.getItem("token")) {
        return <Navigate to="/login" />
    }

    const state = getState()

    return (
        <div>
        {!state.loading ? (
                <div className="bg-[#ffc0cb] flex">
                    <Sidebar channelId={undefined} />
                    <div className="bg-[#e8a7b2] w-full m-4 rounded-lg">
                    </div>
                </div>
        ) : (
            <div>
                Loading...
            </div>
        )}
        </div>
    )
})