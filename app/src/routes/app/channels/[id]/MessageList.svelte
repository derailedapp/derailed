<script lang="ts">
import MessageComp from "./Message.svelte";
import { tick } from "svelte";
import { useConvexClient, useQuery } from "convex-svelte";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

let { channelId, username, around, lastMessageId }: { channelId: string; username: string; around?: string | undefined, lastMessageId?: string | undefined } = $props();

// @ts-ignore
let container: Element = $state();
let scrolledDown: boolean = $state(false);

let messageQuery;

if (around == lastMessageId) {
	messageQuery = useQuery(api.messages.newest, {
		channelId: channelId as Id<"channels">,
	});
} else {
	messageQuery = useQuery(api.messages.around, {
		channelId: channelId as Id<"channels">,
		around: around as Id<"messages">
	});
}
let messages = $derived(messageQuery.data || []);
const client = useConvexClient();

$effect(() => {
	if (!scrolledDown && !messageQuery.isLoading && !messageQuery.error) {
		scrollToBottom();
		scrolledDown = true;
	}
	console.log(container.scrollTop)
	if ((container.scrollTop == container.scrollHeight || container.scrollTop < 10) && container) {
		console.log('3')
		markLatestRead();
	}
});

async function markLatestRead() {
	const msg = messages.at(-1);
	if (msg) {
		await client.mutation(api.readstates.read, { channelId: channelId as Id<"channels">, messageId: msg._id })
	}
}

async function scrollToBottom() {
	await tick();
	if (container) {
		if (around == lastMessageId) {
			console.log('1')
			container.scrollTop = container.scrollHeight;
		} else {
			console.log('2')
			container.scrollTop = container.scrollHeight / 2;
		}
	}
}
</script>

<ul bind:this={container} class="flex flex-col overflow-y-scroll m-auto h-full w-full rounded-b-xl">
	<div class="h-full w-full flex flex-col pb-4 select-none items-start justify-end pl-6 text-sm">
		<div class="font-bold text-xl pl-2">
			{username}
		</div>
		<div class="text-center pl-2">
			This is the start of your mutual chat with {username}
		</div>
	</div>
    {#each messages as message, index}
        <MessageComp message={message} messages={messages} index={index} />
    {/each}
</ul>
