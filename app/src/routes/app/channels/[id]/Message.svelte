<script lang="ts">
import { Avatar } from "bits-ui";
import moment from "moment-timezone";
import type { Message, Profile } from "$lib/models";
import { channelMessages, users } from "$lib/state";
import { processor } from "$lib/markdown";
import { unScrewHtml } from "$lib/markdown";

let {
	channelId,
	message,
	index,
}: { channelId: string; message: Message; index: number } = $props();

let userData: Profile[] = $state([]);
users.subscribe((data) => (userData = data));

let messages: Message[] = $state([]);
channelMessages.subscribe(
	(v) => (messages = v.get(channelId.toString()) || []),
);

function getDate(ts: number) {
	const now = Date.now() / 1000;
	const difference = now - ts;
	let m = moment.unix(ts).tz(Intl.DateTimeFormat().resolvedOptions().timeZone);
	if (difference < 86400 || cascade) {
		return m.format("LT");
	} else if (difference < 172_800) {
		return "Yesterday at " + m.format("LT");
	}
	return m.calendar() + " " + m.format("h:mm a");
}

function shouldCascade(message: Message, index: number) {
	if (index !== 0) {
		const msg = messages.at(index - 1);
		if (!msg) {
			return false;
		}
		if (
			msg!.author_id == message.author_id &&
			message.created_at - msg!.created_at < 300
		) {
			return true;
		}
	}
	return false;
}

let cascade = shouldCascade(message, index);

function willCascade(index: number) {
	const msg = messages.at(index + 1);
	const otherMsg = messages.at(index + 2);
	if (!msg || !otherMsg) {
		return false;
	}
	if (
		msg.author_id == otherMsg.author_id &&
		otherMsg.created_at - msg!.created_at < 300
	) {
		return true;
	}
	return false;
}
let nextMessageWillCascade = willCascade(index);

async function processContent(content: string) {
	return String(await processor.process(unScrewHtml(content)));
}
</script>

<li class="flex flex-row w-full group gap-3 hover:bg-sexy-lighter-black/30 pl-6 p-1 py-0.5" class:my-2={!cascade && !nextMessageWillCascade} class:pl-7={cascade} class:hover:pl-5={cascade} class:mt-2={!cascade && nextMessageWillCascade} class:items-center={cascade} class:pb-0={nextMessageWillCascade}>
    {#if !cascade}
        <Avatar.Root class="select-none shrink-0 mt-[1px]">
            <Avatar.Image class="rounded-full h-11 w-11" src={import.meta.env.CDN_URL + "" + userData.find((v) => message.author_id == v.user_id)?.avatar} alt={`User Profile Picture`} />
            <Avatar.Fallback><img class="rounded-full h-11 w-11" alt="Fallback Avatar" src={"https://avatars.githubusercontent.com/u/132799819"} /></Avatar.Fallback>
        </Avatar.Root>
    {:else}
        <div class="text-weep-gray select-none w-12 tracking-tighter text-xs font-semibold hidden group-hover:block" style="font-variant-numeric:tabular-nums">
            {getDate(message.last_modified_at)}
        </div>
    {/if}
    <div class="flex flex-col">
        <div class="flex gap-2 items-center" class:hidden={cascade}>
            <div class="hover:underline text-white font-semibold">
                {userData.find((v) => message.author_id == v.user_id)?.username || "Unknown User"}
            </div>
            <div class="text-weep-gray tracking-tighter text-xs">
                {getDate(message.last_modified_at)}
            </div>
        </div>
        <div class="text-white font-light Markdown" class:pl-13={cascade} class:group-hover:pl-0={cascade}>
			{#await processContent(message.content) then html}
            	{@html html}
			{/await}
        </div>
    </div>
</li>