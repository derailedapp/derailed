<script lang="ts">
import { HandWaving } from "phosphor-svelte";
import { addToast, currentPrivateChannelId as currentPrivateChannel } from "$lib/state";
import GuildScroll from "./GuildScroll.svelte";
import User from "$lib/components/User.svelte";
import Settings from "./Settings.svelte";
import { useConvexClient, useQuery } from "convex-svelte";
import { api } from "$convex/_generated/api";
import { Dialog } from "bits-ui";

let channelQuery = useQuery(api.channels.getJoined, {});
let channels = $derived(channelQuery.data || []);

let type: "guild" | "dms" = $state("dms");

let currentPrivateChannelId: string | undefined = $state();
currentPrivateChannel.subscribe((v) => (currentPrivateChannelId = v));

const currentUserQuery = useQuery(api.users.getCurrentProfile, {});
const currentUser = $derived(currentUserQuery.data);

let status = $derived(currentUser?.status);

const client = useConvexClient();

const changeStatus = async () => {
    await client.mutation(api.users.modifyStatus, { status: status });

    addToast("success", "Updated status.", 3000);
}
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
                    <Dialog.Root>
                        <Dialog.Trigger>
                            <button class="hover:bg-primary flex flex-row items-center gap-2 rounded-md rounded-l-4xl w-[190px]">
                                {#if (currentUser !== null)}
                                    <img src={currentUser?.avatarUrl} class="rounded-full h-10" alt="me">
                                {/if}
                                <div class="flex flex-col items-start">
                                    <h1 class="text-sm text-white font-bold">{currentUser?.displayName || currentUser?.username}</h1>
                                    {#if currentUser?.status}
                                        <p class="text-xs text-weep-gray truncate max-w-35">{currentUser?.status}</p>
                                    {/if}
                                </div>
                            </button>
                        </Dialog.Trigger>
                        <Dialog.Portal>

                            <Dialog.Overlay
                                class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
                            />
                            <Dialog.Content class="bg-aside rounded-lg fixed left-[50%] top-[50%] z-50 w-[400px] h-[300px] translate-x-[-50%] translate-y-[-50%] 
                            data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                                <div class="flex flex-col justify-center items-center h-full w-full gap-8">
                                    <textarea style="box-shadow: none;" class="rounded-md bg-aside w-[90%] h-[60%] border resize-none p-3" bind:value={status}></textarea>

                                    <div class="flex flex-row justify-end w-[90%]">
                                        <button onclick={() => { status = undefined; changeStatus() }} class="hover:bg-red-700 transition-all duration-300 px-8 py-2 rounded-sm mr-auto">
                                            Clear
                                        </button>

                                        <button onclick={() => changeStatus()} class="bg-blurple px-8 py-2 rounded-sm">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>

                    <Settings />
                </div>
            </div>
        </div>
    </div>
</div>