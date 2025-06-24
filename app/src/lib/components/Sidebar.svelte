<script lang="ts">
import { HandWaving } from "phosphor-svelte";
import {
	addToast,
	channels,
	currentActor,
	currentPrivateChannelId,
} from "$lib/state";
import GuildScroll from "./GuildScroll.svelte";
import User from "$lib/components/User.svelte";
import Settings from "./Settings.svelte";
import { Dialog } from "bits-ui";

let type: "guild" | "dms" = $state("dms");

const changeStatus = async () => {
	//await client.mutation(api.users.modifyStatus, { status: status });

	addToast("success", "Updated status", 3000);
};
</script>
<div class="flex flex-col select-none">
    <div class="flex h-full w-full">
        <GuildScroll />
        <div class="w-[280px] select-none glass-wrapper round-corners m-2 py-1 flex flex-col justify-between">
            <div class="glass-effect"></div>
            <div class="glass-tint"></div>
            <div class="glass-shine"></div>
            <div class="z-[3]">
				<div class="border-b border-white h-[58px]">
					<a href="/app">
						<div class="p-4 text-white space-x-2 group">
							<HandWaving weight="fill" class="inline w-5 h-5" />
							<div class="inline">
								Friends
							</div>
						</div>
					</a>
				</div>
                <div class="px-4 mb-0 pb-1 pt-4 flex items-center justify-between">
                    {#if (type === "dms")}
                        <div class="text-white text-sm">
                            Direct Messages
                        </div>
                    {/if}
                </div>
                <div class="overflow-y-auto">
                    {#if (type === "dms")}
                        {#each $channels as channel}
                            <User channelId={channel.id} selected={$currentPrivateChannelId == channel.id} />
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>