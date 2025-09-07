<script lang="ts">
import { channels, currentActor, readStates } from "$lib/state";
import Client from "$lib/api";

let {
	channelId,
	selected = false,
}: {
	channelId: string;
	selected?: boolean;
} = $props();

const rtChannel = $derived($channels.find((v) => v.channel.id == channelId));
const channel = $derived(rtChannel!.channel);
const channelMembers = $derived(rtChannel!.members);
const readState = $derived($readStates.find((v) => v.channel_id == channelId));

export function getChannelName() {
	let profile = channelMembers
		?.find((v) => {
			if ($currentActor?.id !== v.deref()!.id) {
				return true;
			}
			return false;
		})!
		.deref()!;
	let name = profile.display_name || profile.username;
	return name!;
}

export function getAvatarUrl() {
	let profile = channelMembers
		?.find((v) => {
			if ($currentActor?.id !== v.deref()!.id) {
				return true;
			}
			return false;
		})!
		.deref()!;
	if (profile.avatar_id) {
		return Client.getCDNUrl("avatars", profile.avatar_id);
	} else {
		return "/default_pfp.webp";
	}
}
</script>

<!--TODO: Add logic-->

<a href={`/app/channels/${channelId}`} class="flex flex-row border-blurple items-center gap-3 hover:bg-sexy-lighter-black/70 hover:backdrop-blur-3xl p-4 py-1.5 transition-all duration-100 w-full border-l" class:bg-blurple={selected} class:to-aside={selected} class:border-l-transparent={!selected}>
    <img class="rounded-full h-8 w-auto" src={getAvatarUrl()} alt={`@${getChannelName()}`} />

	<div>
		<div class="text-weep-gray truncate" class:text-white={readState?.last_message_id != channel?.last_message_id || selected}>
        	{getChannelName()}
    	</div>
	</div>
</a>