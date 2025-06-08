<script lang="ts">
import MessageComp from "./Message.svelte";
import { onMount, tick } from "svelte";
import { useConvexClient, useQuery } from "convex-svelte";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

let { channelId, username, around, lastMessageId }: { channelId: string; username: string; around?: string | undefined, lastMessageId?: string | undefined } = $props();

let container: Element | undefined = $state();
let loadNewer: Element | undefined = $state();
let loadOlder: Element | undefined = $state();

let loadingOlder: boolean = $state(false);
let loadingNewer: boolean = $state(false);

let loadedInitialNewest: boolean = $state(false);
let loadedInitialMiddle: boolean = $state(false);
let loadedInitialAfter: boolean = $state(false);
let loadedInitialBefore: boolean = $state(false);
let scrolledDown: boolean = $state(false);
let newestCursor: string | null = $state(null);
let afterCursor: string | null = $state(null);
let beforeCursor: string | null = $state(null);

let messageQuery = null;
let middleMessageQuery = null;
let afterMessageQuery = null;
let beforeMessageQuery = null;

if (around == lastMessageId) {
	messageQuery = useQuery(api.messages.newest, {
		channelId: channelId as Id<"channels">,
		paginationOpts: { numItems: 50, cursor: null }
	});
} else {
	middleMessageQuery = useQuery(api.messages.get, {
		channelId: channelId as Id<"channels">,
		id: around as Id<"messages">
	});
	afterMessageQuery = useQuery(api.messages.after, {
		channelId: channelId as Id<"channels">,
		after: around as Id<"messages">,
		paginationOpts: { numItems: 25, cursor: null }
	});
	beforeMessageQuery = useQuery(api.messages.before, {
		channelId: channelId as Id<"channels">,
		before: around as Id<"messages">,
		paginationOpts: { numItems: 25, cursor: null }
	});
}
let messages = $state<any[]>([]);
const client = useConvexClient();

const concatAndOrder = (list: any[]) => {
	const new_messages = messages.concat(list);
	messages = new_messages.sort((a, b) => a._creationTime - b._creationTime);
}

$effect(() => {
	if (messageQuery?.data && !loadedInitialNewest) {
		newestCursor = messageQuery.data.continueCursor;
		concatAndOrder(messageQuery.data.page);
		loadedInitialNewest = true;
		if (!scrolledDown) {
			scrollToBottom();
			scrolledDown = true;
		}
	}
	if (middleMessageQuery?.data && !loadedInitialMiddle) {
		concatAndOrder([middleMessageQuery.data]);
		loadedInitialMiddle = true;
	}
	if (afterMessageQuery?.data && !loadedInitialAfter) {
		afterCursor = afterMessageQuery.data.continueCursor;
		concatAndOrder(afterMessageQuery.data.page);
		loadedInitialAfter = true;
	}
	if (beforeMessageQuery?.data && !loadedInitialBefore) {
		beforeCursor = beforeMessageQuery.data.continueCursor;
		concatAndOrder(beforeMessageQuery.data.page);
		loadedInitialBefore = true;
	}
})

$effect(() => {
	if (!scrolledDown && afterMessageQuery?.data && beforeMessageQuery?.data && middleMessageQuery?.data && loadedInitialBefore) {
		scrollToCenter();
		scrolledDown = true;
	}
});

async function getNewerMessages() {
	const query = await client.query(api.messages.after, { channelId: channelId as Id<"channels">, after: around as Id<"messages">, paginationOpts: { cursor: afterCursor, numItems: 25 } });
	afterCursor = query.continueCursor;
	concatAndOrder(query.page);
	loadingNewer = false;
}

async function getOlderMessages() {
	console.log(2)
	if (beforeCursor) {
		const query = await client.query(api.messages.before, { channelId: channelId as Id<"channels">, before: around as Id<"messages">, paginationOpts: { cursor: beforeCursor, numItems: 25 } });
		beforeCursor = query.continueCursor;
		concatAndOrder(query.page);
	} else if (newestCursor) {
		const query = await client.query(api.messages.newest, { channelId: channelId as Id<"channels">, paginationOpts: { cursor: newestCursor, numItems: 25 } });
		newestCursor = query.continueCursor;
		concatAndOrder(query.page);
	}
	loadingOlder = false
}

async function markLatestRead() {
	const msg = messages.at(-1);
	if (msg) {
		await client.mutation(api.readstates.read, { channelId: channelId as Id<"channels">, messageId: msg._id })
	}
}

async function scrollToBottom() {
	await tick();
	if (container) {
		container.scrollTop = container.scrollHeight;
	}
}

async function scrollToCenter() {
	await tick();
	if (container) {
		console.log(3)
		container.scrollTo({
			top: container.children[container.children.length - 1].scrollTop
		})
	}
}

onMount(() => {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((v) => {
			if (v.target.id == "loadOlder" && (newestCursor || beforeCursor) && !loadingOlder) {
				console.log(1)
				loadingOlder = true;
				getOlderMessages();
			}
			if (v.target.id == "loadNewer") {
				if (afterCursor && !loadingNewer) {
					loadingNewer = false;
					getNewerMessages();
				} else {
					markLatestRead();
				}
			}
		})
	}, { threshold: 0.2, root: container! })
	observer.observe(loadOlder!);
	observer.observe(loadNewer!);
})
</script>

<ul bind:this={container} class="flex flex-col overflow-y-scroll m-auto h-full w-full rounded-b-xl">
	<div class="h-full w-full flex flex-col pb-4 py-2 select-none items-start justify-end pl-6 text-sm">
		<div class="font-bold text-xl pl-2">
			{username}
		</div>
		<div class="text-center pl-2">
			This is the start of your mutual chat with {username}
		</div>
	</div>
	<div id="loadOlder" bind:this={loadOlder} class="p-1"></div>
    {#each messages as message, index}
        <MessageComp message={message} messages={messages} index={index} />
    {/each}
	<div id="loadNewer" bind:this={loadNewer} class="p-1"></div>
</ul>
