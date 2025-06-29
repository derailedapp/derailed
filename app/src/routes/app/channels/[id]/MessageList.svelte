<script lang="ts">
import MessageComp from "./Message.svelte";
import { onMount, tick } from "svelte";

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

let messages = $state<any[]>([]);

onMount(() => {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((v) => {});
		},
		{ threshold: 0.2, root: container! },
	);
	observer.observe(loadOlder!);
	observer.observe(loadNewer!);
});
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
