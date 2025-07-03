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
import CurrentUserDialog from "./CurrentUserDialog.svelte";

let type: "guild" | "dms" = $state("dms");

const changeStatus = async () => {
	//await client.mutation(api.users.modifyStatus, { status: status });

	addToast("success", "Updated status", 3000);
};
</script>
<div class="flex flex-col select-none m-0.5">
    <div class="flex h-full w-full">
        <GuildScroll />
        <div class="w-[280px] bg-dark-bg border border-tertiary-bg rounded-3xl rounded-l-none rounded-b-none select-none m-0.5 ml-0 mb-0 flex flex-col justify-between">
            <div class="z-[3]">
				<div class="border-b border-tertiary-bg h-[56px]">
					<a href="/app">
						<div class="p-4 text-white flex items-center gap-2 group">
							<HandWaving weight="fill" class="inline w-5 h-5" />
							<div class="inline">
								Friends
							</div>
						</div>
					</a>
				</div>
                <div class="px-4 mb-0 py-2 flex items-center justify-between">
                    {#if (type === "dms")}
                        <div class="text-white text-sm">
                            Direct Messages
                        </div>
                    {/if}
                </div>
                <div class="overflow-y-auto">
                    {#if (type === "dms")}
                        {#each $channels as rtChannel}
                            <User channelId={rtChannel.channel.id} selected={$currentPrivateChannelId == rtChannel.channel.id} />
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </div>
    <CurrentUserDialog />
</div>