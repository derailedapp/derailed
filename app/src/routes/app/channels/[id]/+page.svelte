<script lang="ts">
import { page } from "$app/state";
import "$lib/gateway";
import type { PrivateChannel } from "$lib/models";
import {
	currentPrivateChannel,
	getChannelName,
	privateChannels,
	currentUser,
} from "$lib/state";
import { Hash } from "phosphor-svelte";
import MessageInput from "./MessageInput.svelte";
import MessageList from "./MessageList.svelte";
import moment from "moment-timezone";

const { id } = page.params;

const channelId = id;

let currentChannel: PrivateChannel | undefined = $state(undefined);
privateChannels.subscribe(
	(v) => (currentChannel = v.find((channel) => channel.id == channelId)!),
);
currentPrivateChannel.set(channelId);

function sfToTime(snowflake: string | bigint | number): number {
	const milliseconds = BigInt(snowflake) >> 22n;
	return Number(milliseconds) + 1649325271415;
}
</script>

<div class="w-full h-screen grid grid-rows-[58px_1fr_minmax(58px,auto)] bg-primary">
    <div class="flex flex-1 flex-row items-center p-4 bg-primary border-b border-guild-aside">
        <div class="flex items-center gap-1.5 pl-3 select-none">
            <Hash color="#a0a0a5" height="22" width="22" />
            <div class="text-white truncate max-w-50">
                {#if (currentChannel !== undefined)}
                    {getChannelName(currentChannel)}
                {/if}
            </div>
            <div class="text-weep-gray/50 font-black">•</div>
            <div class="text-weep-gray text-sm">
                This is a text chat with another user
            </div>
        </div>
    </div>
    <div class="flex flex-1 min-h-[300px] bg-primary">
        <MessageList channelId={channelId} />
    </div>
    <div class="flex items-center justify-center h-full">
        <MessageInput />
    </div>
</div>

<div class="h-screen flex flex-col w-[550px]">
    <div class="h-[58px] bg-primary border-b border-guild-aside p-4"></div>
    <div class="h-full w-full flex flex-col bg-mem-aside">
        <div class="bg-blurple pb-5">
            <div class="flex flex-col w-full items-center justify-center">
                {#if $currentUser?.profile.banner === null}
                    <div class="bg-guild-aside w-full h-[130px]"></div>
                {:else}
                    <img src={import.meta.env.VITE_CDN_URL + "/banners/" +$currentUser?.profile.banner} alt="banner" class="w-full h-[130px] bg-center bg-cover">
                {/if}
                <div class="absolute top-[9.5rem]">
                    {#if $currentUser?.profile.avatar === null}
                        <img
                            class="size-[7rem] rounded-full object-cover border-[3px] border-blurple group-hover:opacity-70 transition-all"
                            src={"/default_pfp.webp"}
                            alt="avatar"
                        />
                    {:else}
                        <img
                            class="size-[7rem] rounded-full object-cover border-[3px] border-blurple group-hover:opacity-70 transition-all"
                            src={import.meta.env.VITE_CDN_URL + "/avatars/" + $currentUser?.profile.avatar}
                            alt="avatar"
                        />
                    {/if}
                </div>

                <div class="flex flex-col justify-center items-center pt-20 select-none">
                    <div class="font-semibold text-xl">
                        {$currentUser?.profile.display_name || $currentUser?.profile.username}
                    </div>
                    <div>
                        {$currentUser?.profile.username}
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col w-full pt-2 gap-4">
            <div class="w-full py-3 px-6 rounded-xl select-none">
                <div class="font-semibold text-sm">
                    Member Since
                </div>
                <div class="text-sm">
                    {moment.unix(sfToTime($currentUser?.account.id || 0) / 1000).format('MMMM Do YYYY, h:mm a')}
                </div>
            </div>
        </div>
    </div>
</div>
