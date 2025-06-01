<script lang="ts">
import type { Message } from "$lib/models";
import { channelMessages, savedChannels } from "$lib/state";
import { get } from "svelte/store";
import JSON from "json-bigint";
import MessageComp from "./Message.svelte";
import { tick } from "svelte";

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

async function getMessages(before: BigInt | undefined = undefined) {
	let url = new URL(
		"/channels/" + channelId.toString() + "/messages",
		import.meta.env.VITE_API_URL,
	);
	if (before !== undefined) {
		url.searchParams.append("before", before.toString());
	}
	const resp = await fetch(url, {
		headers: {
			Authorization: localStorage.getItem("token")!,
		},
	});

	let data: Message[] = JSON({ storeAsString: true }).parse(await resp.text());
	channelMessages.update((msgs) => {
		const current = msgs.get(channelId.toString()) || [];
		let updated = current.concat(data);
		updated.sort((a, b) => {
			if (a.id < b.id) {
				return -1;
			} else {
				return 1;
			}
		});
		return msgs.set(channelId.toString(), updated);
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
