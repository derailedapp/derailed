<script lang="ts">
import type { Message } from "$lib/models";
import { channelMessages, savedChannels } from "$lib/state";
import { get } from "svelte/store";
import MessageComp from "./Message.svelte";
import { tick } from "svelte";
import { goto } from "$app/navigation";

let { channelId }: { channelId: string } = $props();

// @ts-ignore
let container: Element = $state();
let messages: Message[] = $state([]);
channelMessages.subscribe((v) => {
	if (messages.length === 0) {
		scrollToBottom();
	}
	messages = v.get(channelId.toString()) || [];
});

$effect(() => {
	if (messages.length != 0) {
		scrollToBottom();
	}
});

async function getMessages(before: string | undefined = undefined) {
	let url = new URL(
		"/channels/" + channelId + "/messages",
		import.meta.env.VITE_API_URL,
	);
	if (before !== undefined) {
		url.searchParams.append("before", before);
	}
	const resp = await fetch(url, {
		headers: {
			Authorization: localStorage.getItem("token")!,
		},
	});
	if (resp.status === 401) {
		goto("/login");
		return;
	}

	let data: Message[] = JSON.parse(await resp.text());
	channelMessages.update((msgs) => {
		const current = msgs.get(channelId) || [];
		let updated = current.concat(data);
		updated.sort((a, b) => {
			if (a.id < b.id) {
				return -1;
			} else {
				return 1;
			}
		});
		return msgs.set(channelId, updated);
	});
}

if (!get(savedChannels).includes(channelId)) {
	getMessages();
	savedChannels.update((c) => {
		c.push(channelId);
		return c;
	});
}

async function scrollToBottom() {
	await tick();
	if (container) {
		container.scrollTop = container.scrollHeight;
	}
}
</script>

<ul bind:this={container} class="flex flex-col overflow-y-scroll m-auto h-full w-full rounded-b-xl">
    {#each messages as message, index}
        <MessageComp channelId={channelId} message={message} index={index} />
    {/each}
</ul>
