<script lang="ts">
import { page } from "$app/state";
import { Hash } from "phosphor-svelte";
import MessageInput from "./MessageInput.svelte";
import MessageList from "./MessageList.svelte";
import { currentPrivateChannelId, channels, currentActor } from "$lib/state";
import UserPop from "$lib/components/UserPop.svelte";

const { id } = page.params;

const rtChannel = $derived($channels.find((v) => v.channel.id == id));
const channel = $derived(rtChannel!.channel);
const channelMembers = $derived(rtChannel!.members);
const otherUser = $derived(
	channelMembers?.find((v) => v.deref()!.id != $currentActor?.id),
);
currentPrivateChannelId.set(id);
const readState = $derived(rtChannel!.read_state);
const isDM = $derived(channelMembers && channelMembers.length === 2);

export function getChannelName() {
	let profile = channelMembers?.find((v) => {
		if ($currentActor?.id !== v.deref()!.id) {
			return true;
		}
		return false;
	})!;
	let name = profile?.deref()!.display_name || profile?.deref()!.username;
	return name!;
}
</script>
<div class="flex flex-row w-full m-0.5 mr-0">
    <div class="w-full grid grid-rows-[56px_1fr_minmax(56px,auto)] m-0.5 rounded-2xl" class:rounded-tr-none={isDM} class:mr-0={isDM}>
        <div class="flex flex-1 flex-row items-center p-4 h-[56px] border-b border-weep-gray">
            <div class="flex items-center gap-1.5 select-none">
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
                <MessageList channelId={id} username={otherUser?.deref()!.display_name || otherUser?.deref()!.username || ""} lastMessageId={channel.last_message_id} around={readState.deref()!.last_message_id} />
            {/if}
        </div>
        <div class="min-h-[56px]">
            <MessageInput channelId={id} channelName={getChannelName()} />
        </div>
    </div>

    {#if isDM}
        <UserPop user={otherUser!.deref()!} unroundLeft={true} />
    {/if}
</div>
