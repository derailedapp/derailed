<script lang="ts">
import { page } from "$app/state";
import "$lib/gateway";
import type { PrivateChannel } from "$lib/models";
import {
	currentPrivateChannel,
	getChannelName,
	privateChannels,
} from "$lib/state";
import { Hash } from "phosphor-svelte";
import MessageInput from "./MessageInput.svelte";
import MessageList from "./MessageList.svelte";

const { id } = page.params;

const channelId = BigInt(id);

let currentChannel: PrivateChannel | undefined = $state(undefined);
privateChannels.subscribe(
	(v) =>
		(currentChannel = v.find(
			(channel) => channel.id.valueOf() == channelId.valueOf(),
		)!),
);
currentPrivateChannel.set(channelId);
</script>

<div class="w-full h-screen grid grid-rows-[58px_1fr_minmax(58px,auto)] gap-2 p-2 pl-0.5">
    <div class="flex flex-1 flex-row items-center p-4 backdrop-blur-3xl rounded-2xl border-[1px] bg-sexy-red-black/60 border-sexy-lighter-black">
        <div class="flex items-center gap-1.5 select-none">
            <Hash color="#a0a0a5" height="22" width="22" />
            <div class="text-white truncate max-w-50">
                {#if (currentChannel !== undefined)}
                    {getChannelName(currentChannel)}
                {/if}
            </div>
            <div class="text-sexy-gray/50 font-black">•</div>
            <div class="text-sexy-gray/85">
                This is a text chat with another user
            </div>
        </div>
    </div>
    <div class="flex flex-1 backdrop-blur-3xl min-h-[580px] rounded-2xl border-[1px] bg-sexy-red-black/60 border-sexy-lighter-black">
        <MessageList channelId={channelId} />
    </div>
    <div class="flex flex-1 items-center h-full w-full backdrop-blur-3xl rounded-2xl border-[1px] bg-sexy-red-black/60 border-sexy-lighter-black">
        <MessageInput />
    </div>
</div>