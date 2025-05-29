<script lang="ts">
import "$lib/gateway";

import { Gear } from "phosphor-svelte";
import GuildScroll from "./GuildScroll.svelte";
import AddFriend from "$lib/components/AddFriend.svelte";
import { currentUser, privateChannels } from "$lib/state";
import { type Profile, type Account, type PrivateChannel } from "$lib/models";
import User from "$lib/components/User.svelte";

let currentUserData: { profile: Profile; account: Account } | null =
	$state(null);

currentUser.subscribe((data) => (currentUserData = data));

let privateChannelData: PrivateChannel[] = $state([]);

privateChannels.subscribe((data) => (privateChannelData = data));

function getChannelName(channel: PrivateChannel) {
	if (channel.members !== undefined && channel.type === 0) {
		let profile = channel.members.find((v) => {
			if (currentUserData?.profile.user_id.valueOf() !== v.user_id.valueOf()) {
				return true;
			}
			return false;
		})!;
		let name = profile.display_name || profile.username;
		return name!;
	} else {
		return channel.name || "Some Channel";
	}
}
</script>

<!--TODO: Add logic-->
<div class="bg-[#0b0b0d] h-screen w-full">
    <div class="flex h-full w-full flex-row">
        <div class="flex flex-col">
            <div class="flex h-full w-full">
                <GuildScroll />
                <div class="w-[275px] backdrop-blur-3xl rounded-3xl border-[1px] m-2 bg-sexy-red-black/60 border-sexy-lighter-black">
                    <div class="m-4 mb-0 flex items-center justify-between">
                        <div class="text-sexy-gray">
                            Direct Messages
                        </div>
                        <AddFriend />
                    </div>
                    <div class="m-2 overflow-y-auto">
                        {#each privateChannelData as channel}
                            <User username={getChannelName(channel)} avatarUrl="https://avatars.githubusercontent.com/u/132799819" />
                        {/each}
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

                    <a href="/app/settings" class="ml-auto">
                        <Gear weight="fill" class="w-5 h-5 text-sexy-gray hover:text-white transition-colors duration-100" />
                    </a>
                </div>
            </div>
        </div>

        <div class="flex flex-1 backdrop-blur-3xl rounded-3xl border-[1px] my-2 mr-2 bg-sexy-red-black/60 border-sexy-lighter-black">
            
        </div>
    </div>
</div>