<script lang="ts">
import { page } from "$app/state";
import { Hash } from "phosphor-svelte";
import MessageInput from "./MessageInput.svelte";
import MessageList from "./MessageList.svelte";
    import { currentPrivateChannelId, channels, channelMembers as channelMemberStore, currentActor, readStates } from "$lib/state";
    import UserPop from "$lib/components/UserPop.svelte";

const { id } = page.params;

const channel = $derived($channels.find((v) => v.id == id))
const channelMembers = $derived($channelMemberStore.get(id));
const otherUser = $derived(channelMembers?.find((v) => v.id != $currentActor?.id));
currentPrivateChannelId.set(id);
const readState = $derived($readStates.find((v) => v.channel_id == id))

export function getChannelName() {
	let profile = channelMembers?.find((v) => {
		if ($currentActor?.id !== v.id) {
			return true;
		}
		return false;
	})!;
	let name = profile.display_name || profile.username;
	return name!;
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
        {#if channel && readState}
            <MessageList channelId={id} username={otherUser?.display_name || otherUser?.username || ""} lastMessageId={channel.last_message_id} around={readState.last_message_id} />
        {/if}
    </div>
    <div class="flex items-center justify-center h-full">
        <MessageInput channelId={id} channelName={getChannelName()} />
    </div>
</div>

{#if channelMembers && channelMembers.length === 2}
    <UserPop user={otherUser!} />
{/if}
