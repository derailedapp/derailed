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
import Settings from "./dialogs/Settings.svelte";
import { Dialog } from "bits-ui";
import CurrentUserDialog from "./CurrentUserDialog.svelte";

let type: "guild" | "dms" = $state("dms");

const changeStatus = async () => {
	//await client.mutation(api.users.modifyStatus, { status: status });

	addToast("success", "Updated status", 3000);
};
</script>
<div class="flex flex-col select-none h-full m-0.5">
    <div class="flex flex-col h-full w-full mb-1">
        <div class="w-[280px] bg-white border h-full border-weep-gray rounded-2xl select-none m-0.5 flex flex-col justify-between">
            <div class="z-[3]">
				<div class="border-b border-weep-gray h-[56px]">
					<a href="/app">
						<div class="p-4 text-white flex items-center gap-2 group">
							<HandWaving weight="fill" class="inline w-5 h-5" />
							<div class="inline">
								Friends
							</div>
						</div>
					</a>
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
</div>