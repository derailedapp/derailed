<script>
import { Gear, Plus } from "phosphor-svelte";
import GuildScroll from "./GuildScroll.svelte";
import { Dialog } from "bits-ui";
import { fly } from "svelte/transition";
</script>

<!--TODO: Add logic-->
<div class="bg-[#0b0b0d] h-screen w-full bg-center bg-cover">
    <div class="flex h-full w-full flex-row">
        <div class="h-full flex flex-col">
            <div class="flex h-full w-full">
                <GuildScroll />
                <div class="flex flex-col w-[275px] backdrop-blur-3xl rounded-3xl border-[1px] m-2 bg-sexy-red-black/60 border-sexy-lighter-black">
                    <div class="m-4 mb-0 flex items-center justify-between">
                        <div class="text-sexy-gray">
                            Direct Messages
                        </div>
                        <Dialog.Root>
                            <Dialog.Trigger class="cursor-pointer">
                                <Plus color="#a0a0a5" class="h-5 w-5" />
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay 
                                    class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[998] bg-black/30 backdrop-blur-sm"
                                />
                                <Dialog.Content class="rounded-2xl outline-hidden fixed left-[50%] top-[50%] z-[9999] w-full translate-x-[-50%] translate-y-[-50%] border border-sexy-lighter-black py-8 px-12 max-w-[500px] bg-sexy-red-black/80">
                                    <div class="flex flex-col items-center justify-start text-white gap-2">
                                        <h1 class="font-semibold text-lg">Add a Friend</h1>
                                        <p class="text-sm">Place the username of the person you wanna friend request!</p>

                                        <input type="text" class="rounded-lg w-full bg-transparent border border-sexy-lighter-black outline-none focus:ring-0 my-3">

                                        <button class="w-full bg-blurple p-3 rounded-lg font-semibold">
                                            Add
                                        </button>
                                    </div>
                                    <Dialog.Close />
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </div>
                        <div class="m-2 overflow-y-auto">
                    </div>
                </div>
            </div>

            <div class="flex h-[80px] w-[360px] backdrop-blur-3xl rounded-3xl border-[1px] mb-2 mx-2 bg-sexy-red-black/60 border-sexy-lighter-black">
                <div class="flex flex-row justify-center items-center gap-2 p-3 w-full">
                    <img src="https://avatars.githubusercontent.com/u/132799819" class="rounded-xl h-9" alt="ananas">
                    <div class="flex flex-col">
                        <h1 class="text-sm">@ananasmoe</h1>
                        <p class="text-xs text-sexy-gray">I love men</p>
                    </div>

                    <a href="/app/settings" class="flex ml-auto">
                        <Gear weight="fill" class="w-5 h-5 text-sexy-gray hover:text-white transition-colors duration-100" />
                    </a>
                </div>
            </div>
        </div>

        <div class="flex flex-1 backdrop-blur-3xl rounded-3xl border-[1px] my-2 mr-2 bg-sexy-red-black/60 border-sexy-lighter-black">
            
        </div>
    </div>
</div>