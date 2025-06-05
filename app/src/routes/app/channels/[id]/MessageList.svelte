<script lang="ts">
import { get } from "svelte/store";
import MessageComp from "./Message.svelte";
import { tick } from "svelte";
import { goto } from "$app/navigation";
import { useQuery } from "convex-svelte";
import { api } from "$lib/convex/_generated/api";
import type { Id } from "$lib/convex/_generated/dataModel";

let { channelId }: { channelId: string } = $props();

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
		container.scrollTop = container.scrollHeight;
	}
}
</script>

<ul bind:this={container} class="flex flex-col overflow-y-scroll m-auto h-full w-full rounded-b-xl">
    {#each messages as message, index}
        <MessageComp channelId={channelId} message={message} messages={messages} index={index} />
    {/each}
</ul>
