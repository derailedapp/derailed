<script lang="ts">
import { Avatar } from "bits-ui";
import moment from "moment-timezone";
import type { Message, Profile } from "$lib/models";
import { channelMessages, users } from "$lib/state";
import { processor } from "$lib/markdown";

let {
	channelId,
	message,
	index,
}: { channelId: BigInt; message: Message; index: number } = $props();

let userData: Profile[] = $state([]);
users.subscribe((data) => (userData = data));

let messages: Message[] = $state([]);
channelMessages.subscribe((v) => (messages = v.get(channelId) || []));

function getDate(ts: number) {
	const now = Date.now() / 1000;
	const difference = now - ts;
	let m = moment.unix(ts).tz(Intl.DateTimeFormat().resolvedOptions().timeZone);
	if (difference < 86400) {
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
			msg!.author_id.valueOf() == message.author_id.valueOf() &&
			message.created_at - msg!.created_at < 300
		) {
			return true;
		}
	}
	return false;
}

function willCascade(index: number) {
	const msg = messages.at(index + 1);
	const otherMsg = messages.at(index + 2);
	if (!msg || !otherMsg) {
		return false;
	}
	if (
		msg.author_id.valueOf() == otherMsg.author_id.valueOf() &&
		otherMsg.created_at - msg!.created_at < 300
	) {
		return true;
	}
	return false;
}

let cascade = shouldCascade(message, index);
let nextMessageWillCascade = willCascade(index);

function processContent(content: string) {
	return String(processor.processSync(content));
}
</script>

<li class="flex flex-row w-full group gap-3 hover:bg-sexy-lighter-black/30" class:items-center={cascade} class:py-half-one={cascade} class:pb-1={nextMessageWillCascade} class:pl-6={cascade} class:p-6={!cascade} class:py-4={!cascade}>
    {#if !cascade}
        <Avatar.Root class="select-none">
            <Avatar.Image class="rounded-full h-10 w-10" src={import.meta.env.CDN_URL + "" + userData.find((v) => message.author_id == v.user_id)?.avatar} alt={`User Profile Picture`} />
            <Avatar.Fallback><img class="rounded-full h-10 w-10" alt="Fallback Avatar" src={"https://avatars.githubusercontent.com/u/132799819"} /></Avatar.Fallback>
        </Avatar.Root>
    {:else}
        <div class="text-sexy-gray/55 tracking-tighter text-xs font-semibold hidden group-hover:block">
            {getDate(message.last_modified_at)}
        </div>
    {/if}
    <div class="flex flex-col">
        <div class="flex gap-1.5 items-center" class:hidden={cascade}>
            <div class="hover:underline font-semibold">
                {userData.find((v) => message.author_id.valueOf() == v.user_id.valueOf())?.username || "Unknown User"}
            </div>
            <div class="text-sexy-gray/55 tracking-tighter text-xs font-semibold">
                {getDate(message.last_modified_at)}
            </div>
        </div>
        <div class:pl-13={cascade} class:group-hover:pl-0={cascade}>
            {@html processContent(message.content)}
        </div>
    </div>
</li>