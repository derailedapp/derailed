<script lang="ts">
    import { api } from "$convex/_generated/api";
    import type { Id } from "$convex/_generated/dataModel";
    import { useQuery } from "convex-svelte";

let {
	channelId,
	selected = false,
}: {
	channelId: string;
	selected?: boolean;
} = $props();

const currentUserQuery = useQuery(api.users.getCurrentProfile, {});
const currentUser = $derived(currentUserQuery.data);
const channel = useQuery(api.channels.get, { id: channelId as Id<"channels"> });
const channelMembers = useQuery(api.channels.getMembers, {
	id: channelId as Id<"channels">,
});
const readStateQuery = useQuery(api.readstates.getReadState, { id: channelId as Id<"channels"> });
const readState = $derived(readStateQuery.data)

export function getChannelName() {
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

export function getAvatarUrl() {
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
		return profile.avatarUrl;
	} else {
		return "/default_pfp.webp";
	}
}
</script>

<!--TODO: Add logic-->

<a href={`/app/channels/${channelId}`} class="flex flex-row border-blurple items-center gap-3 hover:bg-sexy-lighter-black/70 hover:backdrop-blur-3xl p-4 py-1.5 my-0.5 transition-all duration-100 w-full" class:bg-gradient-to-r={selected} class:from-primary={selected} class:from-70%={selected} class:to-95%={selected} class:to-aside={selected} class:border-l-2={selected}>
    <img class="rounded-full h-9 w-9" src={getAvatarUrl()} alt={`@${getChannelName()}`} />

    <div class="text-weep-gray truncate" class:font-bold={readState?.lastMessageId != channel.data?.lastMessageId || selected} class:text-white={readState?.lastMessageId != channel.data?.lastMessageId || selected}>
        {getChannelName()}
    </div>
</a>