<script lang="ts">
import { page } from "$app/state";
import { Hash } from "phosphor-svelte";
import MessageInput from "./MessageInput.svelte";
import MessageList from "./MessageList.svelte";
import {
	currentPrivateChannelId,
	channels,
	currentActor,
	readStates,
} from "$lib/state";
import UserPop from "$lib/components/UserPop.svelte";

const { id } = page.params;

const rtChannel = $derived($channels.find((v) => v.channel.id == id));
const channel = $derived(rtChannel!.channel);
const channelMembers = $derived(rtChannel!.members);
const otherUser = $derived(
	channelMembers?.find((v) => v.id != $currentActor?.id),
);
currentPrivateChannelId.set(id);
const readState = $derived($readStates.find((v) => v.channel_id == id));

export function getChannelName() {
	let profile = channelMembers?.find((v) => {
		if ($currentActor?.id !== v.id) {
			return true;
		}
		return false;
	})!;
	let name = profile?.display_name || profile?.username;
	return name!;
}
</script>

<div class="w-full grid grid-rows-[62px_1fr_minmax(56px,auto)] bg-dark-bg border m-1 border-tertiary-bg rounded-4xl">
    <div class="flex flex-1 flex-row items-center p-4 h-[62px] border-b border-tertiary-bg">
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
    <div class="flex flex-1 min-h-[300px]">
        {#if channel && readState}
            <MessageList channelId={id} username={otherUser?.display_name || otherUser?.username || ""} lastMessageId={channel.last_message_id} around={readState.last_message_id} />
        {/if}
    </div>
    <div class="min-h-[56px]">
        <MessageInput channelId={id} channelName={getChannelName()} />
    </div>
</div>

{#if channelMembers && channelMembers.length === 2}
    <UserPop user={otherUser!} />
{/if}
