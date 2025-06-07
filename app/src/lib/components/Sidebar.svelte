<script lang="ts">
import { Gear, HandWaving } from "phosphor-svelte";
import { currentPrivateChannelId as currentPrivateChannel } from "$lib/state";
import GuildScroll from "./GuildScroll.svelte";
import AddFriend from "$lib/components/AddFriend.svelte";
import User from "$lib/components/User.svelte";
import Settings from "./Settings.svelte";
import { useQuery } from "convex-svelte";
import { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

let channelQuery = useQuery(api.channels.getJoined, {});
let channels = $derived(channelQuery.data || []);

let type: "guild" | "dms" = $state("dms");

let currentPrivateChannelId: string | undefined = $state();
currentPrivateChannel.subscribe((v) => (currentPrivateChannelId = v));

const currentUserQuery = useQuery(api.users.getCurrentProfile, {});
const currentUser = $derived(currentUserQuery.data);
</script>
<div class="flex flex-col select-none">
    <div class="flex h-full w-full">
        <GuildScroll />
        <div class="w-[280px] select-none bg-aside h-full flex flex-col justify-between">
            <div>
				<div class="border-b border-guild-aside h-[58px]">
					<a href="/app">
						<div class="p-4 text-weep-gray space-x-2 group hover:bg-sexy-lighter-black/70">
							<HandWaving weight="fill" class="inline w-5 h-5" />
							<div class="inline group-hover:text-white">
								Friends
							</div>
						</div>
					</a>
				</div>
                <div class="px-4 mb-0 pb-1 pt-4 flex items-center justify-between">
                    {#if (type === "dms")}
                        <div class="text-weep-gray text-sm">
                            Direct Messages
                        </div>
                    {/if}
                </div>
                <div class="overflow-y-auto">
                    {#if (type === "dms")}
                        {#each channels as channel}
                            <User channelId={channel._id} selected={currentPrivateChannelId == channel._id} />
                        {/each}
                    {/if}
                </div>
            </div>
            <div class="h-[70px] backdrop-blur-3xl bg-me border-sexy-lighter-black">
                <div class="flex flex-row justify-center items-center gap-2 p-3 px-4 w-full h-full">
					<div class="hover:bg-primary flex flex-row item-center gap-2 rounded-md rounded-l-4xl w-full">
						{#if (currentUser !== null)}
							<img src={currentUser?.avatarUrl} class="rounded-full h-10 scale-110" alt="me">
						{/if}
						<div class="flex flex-col">
							<h1 class="text-sm text-white">{currentUser?.displayName || currentUser?.username}</h1>
							<p class="text-xs text-weep-gray">This is a placeholder</p>
						</div>
					</div>

                    <Settings />
                </div>
            </div>
        </div>
    </div>
</div>