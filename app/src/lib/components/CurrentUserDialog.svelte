<script>
import { Dialog } from "bits-ui";
import { currentActor } from "$lib/state";
import Settings from "./Settings.svelte";
import Client from "../api";

</script>
<div class="m-0.5 mt-0 backdrop-blur-3xl bg-dark-bg border rounded-b-xl border-tertiary-bg border-t-0">
    <div class="flex flex-row justify-center items-center gap-2 w-full h-full">
        <Dialog.Root>
            <Dialog.Trigger>
                <button class="hover:bg-light-bg p-2 px-3 flex flex-row items-center gap-2 rounded-l-2xl rounded-tl-none w-[190px]">
                    {#if ($currentActor !== undefined)}
                        {#if $currentActor.avatar_id === null}
                            <div class="bg-blurple w-10 h-10 rounded-full"></div>
                        {:else}
                            <img src={Client.getCDNUrl("avatars", $currentActor.avatar_id)} class="rounded-full w-10 h-10 bg-light-bg" alt="">
                        {/if}
                    {/if}
                    <div class="flex flex-col items-start">
                        <h1 class="text-sm text-white font-bold">{$currentActor?.display_name || $currentActor?.username}</h1>
                        <p class="text-xs text-weep-gray truncate max-w-35">Placeholder</p>
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
                        <textarea style="box-shadow: none;" class="rounded-md bg-aside w-[90%] h-[60%] border resize-none p-3"></textarea>

                        <div class="flex flex-row justify-end w-[90%]">
                            <button class="hover:bg-red-700 transition-all duration-300 px-8 py-2 rounded-sm mr-auto">
                                Clear
                            </button>

                            <button class="bg-blurple px-8 py-2 rounded-sm">
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