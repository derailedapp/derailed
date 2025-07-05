<script lang="ts">
import MessageComp from "./Message.svelte";
import { onMount } from "svelte";
import type { Message } from "$lib/models";
import { channelMessages, users } from "$lib/state";
import Client from "$lib/api";

let {
	channelId,
	username,
	around,
	lastMessageId,
}: {
	channelId: string;
	username: string;
	around?: string | undefined;
	lastMessageId?: string | null;
} = $props();

let container: Element | undefined = $state();
let loadNewer: Element | undefined = $state();
let loadOlder: Element | undefined = $state();

let loadingOlder: boolean = $state(false);
let loadingNewer: boolean = $state(false);

let messages = $derived<Message[]>($channelMessages.get(channelId) || []);

async function loadInitial() {
	let resp: Response;
	if (around) {
		resp = await Client.request(
			"GET",
			`/channels/${channelId}/messages?around=${around}`,
			undefined,
		);
	} else {
		resp = await Client.request(
			"GET",
			`/channels/${channelId}/messages`,
			undefined,
		);
	}
	let data: Message[] = await resp.json();
	let msgs = data.map((v) => {
		v.author = new WeakRef($users.find((v2) => v2.id == v.author_id)!);
		return v;
	});
	channelMessages.update((v) => {
		v.set(channelId, msgs.reverse());
		return v;
	});
}

async function loadOld() {
	loadingOlder = true;
	let resp: Response;
	let oldestMessage = messages.at(-1);
	if (!oldestMessage) {
		return;
	}
	resp = await Client.request(
		"GET",
		`/channels/${channelId}/messages?before=${oldestMessage!.id}`,
		undefined,
	);
	let data: Message[] = await resp.json();
	let msgs = data.map((v) => {
		v.author = new WeakRef($users.find((v2) => v2.id == v.author_id)!);
		return v;
	});
	// @ts-ignore
	channelMessages.update((mms) => {
		let ms = mms.get(channelId);
		msgs.forEach((m) => ms!.push(m));
		return ms;
	});
	loadingOlder = false;
}

async function loadNew() {
	loadingNewer = true;
	let resp: Response;
	let newestMessage = messages.at(0);
	if (!newestMessage) {
		return;
	}
	resp = await Client.request(
		"GET",
		`/channels/${channelId}/messages?before=${newestMessage!.id}`,
		undefined,
	);
	let data: Message[] = await resp.json();
	let msgs = data.map((v) => {
		v.author = new WeakRef($users.find((v2) => v2.id == v.author_id)!);
		return v;
	});
	// @ts-ignore
	channelMessages.update((mms) => {
		let ms = mms.get(channelId);
		msgs.forEach((m) => ms!.unshift(m));
		return ms;
	});
	loadingNewer = false;
}

onMount(() => {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((v) => {
				if (v.target.id == "loadOlder" && !loadingOlder) {
					loadOld();
				}
				if (v.target.id == "loadNewer" && !loadingNewer) {
					loadNew();
				}
			});
		},
		{ threshold: 0.2, root: container! },
	);
	observer.observe(loadOlder!);
	observer.observe(loadNewer!);
	loadInitial();
});
</script>

<ul bind:this={container} class="flex flex-col overflow-y-scroll m-auto h-full w-full rounded-b-xl">
	<div class="h-full w-full flex flex-col pb-4 py-2 select-none items-start justify-end pl-6 text-sm">
		<div class="font-bold text-xl pl-2">
			{username}
		</div>
		<div class="text-center pl-2 text-weep-gray">
			This is the start of your mutual chat with {username}
		</div>
	</div>
	<div id="loadOlder" bind:this={loadOlder} class="p-1"></div>
    {#each messages as message, index}
        <MessageComp message={message} messages={messages} index={index} />
    {/each}
	<div id="loadNewer" bind:this={loadNewer} class="p-1"></div>
</ul>
