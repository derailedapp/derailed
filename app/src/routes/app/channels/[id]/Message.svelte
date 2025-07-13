<script lang="ts">
import { Avatar, ContextMenu } from "bits-ui";
import moment from "moment-timezone";
import { processor } from "$lib/markdown";
import { unScrewHtml } from "$lib/markdown";
import { IdentificationCard, Pen, Pencil, Trash } from "phosphor-svelte";
import Client from "$lib/api";
import type { Message } from "$lib/models";
import { currentActor, users } from "$lib/state";
    import UserPopUp from "./UserPopUp.svelte";

let {
	message,
	index,
	messages,
}: { message: Message; index: number; messages: Message[] } = $props();

let ctxOpen = $state(false);
let author = $derived($users.find((v) => v.id == message.author_id));

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
			Number(message.created_at - msg!.created_at) < 480_000
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
		Number(otherMsg.created_at - msg!.created_at) < 480_000
	) {
		return true;
	}
	return false;
}
let nextMessageWillCascade = willCascade(index);

async function processContent(content: string | undefined | null) {
	if (!content) {
		return "";
	}
	return String(await processor.process(unScrewHtml(content)));
}
</script>

<ContextMenu.Root bind:open={ctxOpen}>
	<ContextMenu.Trigger>
		<li id={message.id} class="flex flex-row w-full group hover:bg-sexy-lighter-black/30 pl-6 p-1 py-0.5" class:gap-3={!cascade} class:gap-1={cascade} class:my-2={!cascade && !nextMessageWillCascade} class:pl-7={cascade} class:hover:pl-5={cascade} class:mt-2={!cascade && nextMessageWillCascade} class:items-center={cascade} class:pb-0={nextMessageWillCascade}>
			{#if !cascade}
				<UserPopUp user={author!}>
					<Avatar.Root class="select-none shrink-0 mt-[1px]">
						<Avatar.Image class="rounded-full h-11 w-11" src={Client.getCDNUrl("avatars", author?.avatar_id!)} alt={`User Profile Picture`} />
						<Avatar.Fallback><img class="rounded-full h-11 w-11" alt="Fallback Avatar" src={"https://avatars.githubusercontent.com/u/132799819"} /></Avatar.Fallback>
					</Avatar.Root>
				</UserPopUp>
			{:else}
				<div class="text-weep-gray select-none w-14 tracking-tighter text-xs hidden group-hover:block" style="font-variant-numeric:tabular-nums">
					{getDate(message.last_modified_at)}
				</div>
			{/if}
			<div class="flex flex-col">
				<div class="flex gap-2 items-center" class:hidden={cascade}>
					<UserPopUp user={author!}>
						<div class="hover:underline text-white font-semibold">
							{author?.display_name || author?.username || "Deleted User"}
						</div>
					</UserPopUp>
					<div class="text-weep-gray tracking-tighter text-xs">
						{getDate(message.created_at)}
					</div>
				</div>
				<div class="text-white font-light text-[16px] Markdown" class:pl-13={cascade} class:group-hover:pl-0={cascade}>
					{#await processContent(message.content) then html}
						{@html html}
					{/await}
				</div>
			</div>
		</li>
	</ContextMenu.Trigger>
	<ContextMenu.Portal>
		<ContextMenu.Content class="flex flex-col items-center text-white/85 tracking-tight text-sm gap-1 w-[200px] p-1.5 rounded-md bg-secondary-bg select-none border border-tertiary-bg">
			{#if author?.id == $currentActor?.id}
				<button type="button" class="p-2 flex flex-row items-center justify-between w-full hover:bg-lighter-bg rounded-sm" onclick={async (e) => {
					e.preventDefault();
					ctxOpen = false;
				}}>
					<div>
						Edit Message
					</div>
					<Pen weight="fill" class="h-auto w-6 text-weep-gray" />
				</button>
				<button type="button" class="p-2 flex flex-row items-center justify-between w-full hover:bg-lighter-bg rounded-sm" onclick={async (e) => {
					e.preventDefault();
					// await client.mutation(api.messages.deleteFromPrivateChannel, { channelId: message.channelId, id: message._id })
					ctxOpen = false;
				}}>
					<div>
						Delete Message
					</div>
					<Trash weight="fill" class="h-auto w-6 text-weep-gray" />
				</button>
				<hr class="text-aside my-2 w-[170px]" />
			{/if}
			<button type="button" class="p-2 flex flex-row items-center justify-between w-full hover:bg-lighter-bg rounded-sm" onclick={(e) => {
				e.preventDefault();
				navigator.clipboard.writeText(message.id);
				ctxOpen = false;
			}}>
				<div>
					Copy Message ID
				</div>
				<IdentificationCard weight="fill" class="h-auto w-6 text-weep-gray" />
			</button>
		</ContextMenu.Content>
	</ContextMenu.Portal>
</ContextMenu.Root>