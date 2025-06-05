<script lang="ts">
import { Gear } from "phosphor-svelte";
import { currentPrivateChannelId as currentPrivateChannel } from "$lib/state";
import GuildScroll from "./GuildScroll.svelte";
import AddFriend from "$lib/components/AddFriend.svelte";
import User from "$lib/components/User.svelte";
import Settings from "./Settings.svelte";
import { useQuery } from "convex-svelte";
import { api } from "$lib/convex/_generated/api";
import type { Id } from "$lib/convex/_generated/dataModel";

let channelQuery = useQuery(api.channels.getJoined, {});
let channels = $derived(channelQuery.data || []);

let type: "guild" | "dms" = $state("dms");

let currentPrivateChannelId: string | undefined = $state();
currentPrivateChannel.subscribe((v) => (currentPrivateChannelId = v));

const currentUserQuery = useQuery(api.users.getCurrentProfile, {});
const currentUser = $derived(currentUserQuery.data);

let showSettings = $state(false);

export function getChannelName(id: string) {
	const channel = useQuery(api.channels.get, { id: id as Id<"channels"> });
	const channelMembers = useQuery(api.channels.getMembers, {
		id: id as Id<"channels">,
	});
	if (
		!channelMembers.isLoading &&
		channelMembers.data &&
		!channel.isLoading &&
		channel.data
	) {
		let profile = channelMembers.data.find((v) => {
			if (currentUser?._id !== v._id) {
				return true;
			}
			return false;
		})!;
		let name = profile.displayName || profile.username;
		return name!;
	} else {
		return channel.data?.name || "Unknown Channel Name";
	}
}
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
                        {#each channels as channel}
                            <User channelId={channel._id} selected={currentPrivateChannelId == channel._id} username={getChannelName(channel._id)} avatarUrl="https://avatars.githubusercontent.com/u/132799819" />
                        {/each}
                    {/if}
                </div>
            </div>
            <div class="h-[70px] backdrop-blur-3xl bg-me border-sexy-lighter-black">
                <div class="flex flex-row justify-center items-center gap-2 p-3 px-4 w-full h-full">
                    {#if (currentUser !== null)}
                        <img src={currentUser?.avatarUrl} class="rounded-full h-10" alt="me">
                    {/if}
                    <div class="flex flex-col">
                        <h1 class="text-sm text-white">{currentUser?.displayName || currentUser?.username}</h1>
                        <p class="text-xs text-weep-gray">This is a placeholder</p>
                    </div>

                    <Settings />
                </div>
            </div>
        </div>
    </div>
</div>