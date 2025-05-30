<script lang="ts">
import type { Message } from "$lib/models";
import { channelMessages, savedChannels } from "$lib/state";
import { get } from "svelte/store";
import JSON from "json-bigint";
import { onMount } from "svelte";
import MessageComp from "./Message.svelte";

let { channelId }: { channelId: BigInt } = $props();

// @ts-ignore
let container: HTMLUListElement = $state();
let messages: Message[] = $state([]);
channelMessages.subscribe((v) => (messages = v.get(channelId) || []));

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

	const data = JSON.parse(await resp.text());
	channelMessages.update((msgs) => {
		const current = msgs.get(channelId) || [];
		let updated = current.concat(data);
		updated.sort((a, b) => {
			if (a.id.valueOf() < b.id.valueOf()) {
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

function scrollToBottom() {
	if (container) {
		container.scrollTop = container.scrollHeight;
	}
}

onMount(scrollToBottom);
$effect(() => scrollToBottom);
</script>

<ul class="flex flex-col justify-end overflow-y-auto m-auto h-full w-full rounded-b-xl">
    {#each messages as message, index}
        <MessageComp channelId={channelId} message={message} index={index} />
    {/each}
</ul>
