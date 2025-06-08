<script lang="ts">
import { page } from "$app/state";
import { Hash } from "phosphor-svelte";
import MessageInput from "./MessageInput.svelte";
import MessageList from "./MessageList.svelte";
import { useQuery } from "convex-svelte";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";
    import { currentPrivateChannelId } from "$lib/state";
    // @ts-ignore
    import UserPop from "$lib/components/UserPop.svelte";

const { id } = page.params;

const currentUser = useQuery(api.users.getCurrentProfile, {});
const channel = useQuery(api.channels.get, { id: id as Id<"channels"> });
const channelMembers = useQuery(api.channels.getMembers, {
	id: id as Id<"channels">,
});
const otherUser = $derived(channelMembers.data?.find((v) => v._id != currentUser.data?._id));
currentPrivateChannelId.set(id);
const readStateQuery = useQuery(api.readstates.getReadState, { id: id as Id<"channels"> });
const readState = $derived(readStateQuery.data)

export function getChannelName() {
	if (
		!channelMembers.isLoading &&
		channelMembers.data &&
		!channel.isLoading &&
		channel.data
	) {
		let profile = channelMembers.data.find((v) => {
			if (currentUser.data?._id !== v._id) {
				return true;
			}
			return false;
		})!;
		let name = profile.displayName || profile.username;
		return name!;
	} else {
		return channel.data?.name || "Unknown Channel Name";
	}
}
</script>

<div class="w-full h-screen grid grid-rows-[58px_1fr_minmax(58px,auto)] bg-primary">
    <div class="flex flex-1 flex-row items-center p-4 bg-primary border-b border-guild-aside">
        <div class="flex items-center gap-1.5 pl-3 select-none">
            <Hash color="#a0a0a5" height="22" width="22" />
            <div class="text-white truncate max-w-50">
                {getChannelName()}
            </div>
            <div class="text-weep-gray/50 font-black">•</div>
            <div class="text-weep-gray text-sm">
                Mutual Chat
            </div>
        </div>
    </div>
    <div class="flex flex-1 min-h-[300px] bg-primary">
        {#if channel.data && readState}
            <MessageList channelId={id} username={otherUser?.displayName || otherUser?.username || ""} lastMessageId={channel.data?.lastMessageId} around={readState.lastMessageId} />
        {/if}
    </div>
    <div class="flex items-center justify-center h-full">
        <MessageInput channelId={id} channelName={getChannelName()} />
    </div>
</div>

{#if !channelMembers.isLoading && channelMembers.data && channelMembers.data.length === 2}
    <UserPop user={otherUser} />
{/if}
