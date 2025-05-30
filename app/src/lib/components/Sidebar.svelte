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
} from "$lib/state";
import { type Profile, type Account, type PrivateChannel } from "$lib/models";
import User from "$lib/components/User.svelte";
import Settings from "./Settings.svelte";

let currentUserData: { profile: Profile; account: Account } | null =
	$state(null);
currentUser.subscribe((data) => (currentUserData = data));

let privateChannelData: PrivateChannel[] = $state([]);
privateChannels.subscribe((data) => (privateChannelData = data));

let type: "guild" | "dms" = $state("dms");
currentSidebarType.subscribe((v) => (type = v));

let currentPrivateChannelId: BigInt | null = $state(null);
currentPrivateChannel.subscribe((v) => (currentPrivateChannelId = v));

let showSettings = $state(false);
</script>
<div class="flex flex-col select-none">
    <div class="flex h-full w-full">
        <GuildScroll />
        <div class="w-[275px] backdrop-blur-3xl select-none rounded-3xl border-[1px] m-2 bg-sexy-red-black/60 border-sexy-lighter-black">
            <div class="m-4 mb-0 flex items-center justify-between">
                {#if (type === "dms")}
                    <div class="text-sexy-gray">
                        Direct Messages
                    </div>
                    <AddFriend />
                {/if}
            </div>
            <div class="m-2 overflow-y-auto">
                {#if (type === "dms")}
                    {#each privateChannelData as channel}
                        <User channelId={channel.id} selected={currentPrivateChannelId?.valueOf() == channel.id.valueOf()} username={getChannelName(channel)} avatarUrl="https://avatars.githubusercontent.com/u/132799819" />
                    {/each}
                {/if}
            </div>
        </div>
    </div>

    <div class="h-[80px] w-[360px] backdrop-blur-3xl rounded-3xl border-[1px] mb-2 mx-2 bg-sexy-red-black/60 border-sexy-lighter-black">
        <div class="flex flex-row justify-center items-center gap-2 p-3 w-full h-full">
            <img src="https://avatars.githubusercontent.com/u/132799819" class="rounded-xl h-9" alt="ananas">
            <div class="flex flex-col">
                <h1 class="text-sm">@{currentUserData?.profile.username}</h1>
                <p class="text-xs text-sexy-gray">This is a placeholder</p>
            </div>

            <Settings />
        </div>
    </div>
</div>