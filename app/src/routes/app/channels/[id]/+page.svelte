<script lang="ts">
import { page } from "$app/state";
import { Hash } from "phosphor-svelte";
import MessageInput from "./MessageInput.svelte";
import MessageList from "./MessageList.svelte";
import moment from "moment-timezone";
import { useQuery } from "convex-svelte";
import { api } from "$lib/convex/_generated/api";
import type { Id } from "$lib/convex/_generated/dataModel";

const { id } = page.params;

const currentUser = useQuery(api.users.getCurrentProfile, {});
const channel = useQuery(api.channels.get, { id: id as Id<"channels"> });
const channelMembers = useQuery(api.channels.getMembers, {
	id: id as Id<"channels">,
});
const otherUser = $derived(channelMembers.data?.at(0));

export function getChannelName() {
	if (
		!channelMembers.isLoading &&
		channelMembers.data &&
		!channel.isLoading &&
		channel.data
	) {
		let profile = channelMembers.data.find((v) => {
			if (currentUser.data?._id !== v._id) {
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

<div class="w-full h-screen grid grid-rows-[58px_1fr_minmax(58px,auto)] bg-primary">
    <div class="flex flex-1 flex-row items-center p-4 bg-primary border-b border-guild-aside">
        <div class="flex items-center gap-1.5 pl-3 select-none">
            <Hash color="#a0a0a5" height="22" width="22" />
            <div class="text-white truncate max-w-50">
                {getChannelName()}
            </div>
            <div class="text-weep-gray/50 font-black">•</div>
            <div class="text-weep-gray text-sm">
                This is a text chat with another user
            </div>
        </div>
    </div>
    <div class="flex flex-1 min-h-[300px] bg-primary">
        <MessageList channelId={id} />
    </div>
    <div class="flex items-center justify-center h-full">
        <MessageInput channelId={id} channelName={""} />
    </div>
</div>

{#if !channelMembers.isLoading && channelMembers.data && channelMembers.data.length === 2}
    <div class="h-screen flex flex-col w-[550px]">
        <div class="h-[58px] bg-primary border-b border-guild-aside p-4"></div>
        <div class="h-full w-full flex flex-col bg-mem-aside">
            <div class="bg-blurple pb-5">
                <div class="flex flex-col w-full items-center justify-center">
                    {#if !otherUser?.bannerUrl}
                        <div class="bg-guild-aside w-full h-[130px]"></div>
                    {:else}
                        <img src={otherUser.bannerUrl} alt="banner" class="w-full h-[130px] bg-center bg-cover">
                    {/if}
                    <div class="absolute top-[9.5rem]">
                        {#if otherUser?.avatarUrl === null}
                            <img
                                class="size-[7rem] rounded-full object-cover border-[3px] border-blurple group-hover:opacity-70 transition-all"
                                src={"/default_pfp.webp"}
                                alt="avatar"
                            />
                        {:else}
                            <img
                                class="size-[7rem] rounded-full object-cover border-[3px] border-blurple group-hover:opacity-70 transition-all"
                                src={otherUser?.avatarUrl}
                                alt="avatar"
                            />
                        {/if}
                    </div>

                    <div class="flex flex-col justify-center items-center pt-20 select-none">
                        <div class="font-semibold text-xl">
                            {otherUser?.displayName || otherUser?.username}
                        </div>
                        <div>
                            {otherUser?.username}
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
                        {moment.unix(otherUser?._creationTime || 0).format('MMMM Do YYYY, h:mm a')}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
