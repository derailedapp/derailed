<script lang="ts">
import { get } from "svelte/store";
import MessageComp from "./Message.svelte";
import { tick } from "svelte";
import { goto } from "$app/navigation";
import { useQuery } from "convex-svelte";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

let { channelId, username }: { channelId: string; username: string } = $props();

// @ts-ignore
let container: Element = $state();
let scrolledDown: boolean = $state(false);

let messageQuery = useQuery(api.messages.newest, {
	channelId: channelId as Id<"channels">,
});
let messages = $derived(messageQuery.data || []);

$effect(() => {
	if (!scrolledDown && !messageQuery.isLoading && !messageQuery.error) {
		scrollToBottom();
	}
});

async function scrollToBottom() {
	await tick();
	if (container) {
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
