<script lang="ts">
import { Gear } from "phosphor-svelte";
import GuildScroll from "./GuildScroll.svelte";
import AddFriend from "$lib/components/AddFriend.svelte";
import {
	currentPrivateChannel,
	currentSidebarType,
	currentUser,
	getChannelName,
	privateChannels,
    getAvatar
} from "$lib/state";
import { type Profile, type Account, type PrivateChannel } from "$lib/models";
import User from "$lib/components/User.svelte";
import Settings from "./Settings.svelte";

let privateChannelData: PrivateChannel[] = $state([]);
privateChannels.subscribe((data) => (privateChannelData = data));

let type: "guild" | "dms" = $state("dms");
currentSidebarType.subscribe((v) => (type = v));

let currentPrivateChannelId: string | null = $state(null);
currentPrivateChannel.subscribe((v) => (currentPrivateChannelId = v));

let showSettings = $state(false);
</script>
<div class="flex flex-col select-none">
    <div class="flex h-full w-full">
        <GuildScroll />
        <div class="w-[280px] select-none bg-aside h-full flex flex-col justify-between">
            <div class="space-y-2">
                <div class="px-4 mb-0 h-[58px] flex items-center justify-between border-b border-b-guild-aside">
                    {#if (type === "dms")}
                        <div class="text-weep-gray">
                            Direct Messages
                        </div>
                        <AddFriend />
                    {/if}
                </div>
                <div class="overflow-y-auto mt-3">
                    {#if (type === "dms")}
                        {#each privateChannelData as channel}
                            <User channelId={channel.id} selected={currentPrivateChannelId?.valueOf() == channel.id.valueOf()} username={getChannelName(channel)} avatarUrl="https://avatars.githubusercontent.com/u/132799819" />
                        {/each}
                    {/if}
                </div>
            </div>
            <div class="h-[70px] backdrop-blur-3xl bg-me border-sexy-lighter-black">
                <div class="flex flex-row justify-center items-center gap-2 p-3 px-4 w-full h-full">
                    <img src={getAvatar()} class="rounded-full h-10" alt="me">
                    <div class="flex flex-col">
                        <h1 class="text-sm text-white">{$currentUser?.profile.display_name || $currentUser?.profile.username}</h1>
                        <p class="text-xs text-weep-gray">This is a placeholder</p>
                    </div>

                    <Settings />
                </div>
            </div>
        </div>
    </div>
</div>