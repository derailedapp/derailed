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
	let profile = channelMembers?.find((v) => {
		if ($currentActor?.id !== v.id) {
			return true;
		}
		return false;
	})!;
	let name = profile.display_name || profile.username;
	return name!;
}

export function getAvatarUrl() {
	let profile = channelMembers?.find((v) => {
		if ($currentActor?.id !== v.id) {
			return true;
		}
		return false;
	})!;
	if (profile.avatar_id) {
		return Client.getCDNUrl("avatars", profile.avatar_id);
	} else {
		return '/default_pfp.webp';
	}
}
</script>

<!--TODO: Add logic-->

<a href={`/app/channels/${channelId}`} class="flex flex-row border-blurple items-center gap-3 hover:bg-sexy-lighter-black/70 hover:backdrop-blur-3xl p-4 py-1.5 my-0.5 transition-all duration-100 w-full" class:bg-lightest-bg={selected} class:to-aside={selected} class:border-l={selected}>
    <img class="rounded-full h-8 w-auto" src={getAvatarUrl()} alt={`@${getChannelName()}`} />

    <div class="text-weep-gray truncate" class:font-semibold={readState?.last_message_id != channel?.last_message_id || selected} class:text-white={readState?.last_message_id != channel?.last_message_id || selected}>
        {getChannelName()}
    </div>
</a>