<script>
    import { Gear, Plus } from "phosphor-svelte";
    import GuildScroll from "./GuildScroll.svelte";
    import { Dialog } from "bits-ui";
</script>

<!--TODO: Add logic-->
<div class="bg-[#0b0b0d]  h-screen w-full bg-center bg-cover">
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
                            <Dialog.Trigger>
                                <Plus color="#a0a0a5" class="h-5 w-5" />
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay class="fixed z-[998] bg-black/30 inset-0" />
                                <Dialog.Content class="fixed h-screen w-full z-[999]">
                                    <div class="flex items-center justify-center z-[999] bg-sexy-red-black/60 inset-0 w-[230px] h-[450px]">
                                        <Dialog.Title>Add a friend!</Dialog.Title>
                                        <Dialog.Description />
                                        <Dialog.Close />
                                    </div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </div>
                    <div class="m-2 overflow-y-auto">
                    </div>
                </div>
            </div>

            <div class="flex h-[90px] w-[360px] backdrop-blur-3xl rounded-3xl border-[1px] m-2 bg-sexy-red-black/60 border-sexy-lighter-black">
                <div class="flex flex-row justify-center items-center gap-2 p-3 w-full">
                    <img src="https://avatars.githubusercontent.com/u/132799819" class="rounded-xl h-9" alt="ananas">
                    <div class="flex flex-col">
                        <h1 class="text-sm">@ananasmoe</h1>
                        <p class="text-xs text-sexy-gray">I love men</p>
                    </div>

                    <div class="flex ml-auto">
                        <Gear weight="fill" class="w-5 h-5 text-sexy-gray hover:text-white" />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-1 backdrop-blur-3xl rounded-3xl border-[1px] my-2 mr-2 bg-sexy-red-black/60 border-sexy-lighter-black">
            
        </div>
    </div>
</div>