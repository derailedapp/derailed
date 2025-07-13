<script lang="ts">
    import type { APIClient } from "$lib/api";
    import { addToast, currentActor } from "$lib/state";
    import { Dialog } from "bits-ui";
    import { Lock, Pencil, X } from "phosphor-svelte";

    let {
        dialogOpen = $bindable(),
        Client,
    }: {
        dialogOpen: boolean;
        Client: APIClient;
    } = $props();

    let currentPassword: string | undefined = $state();
    let newPassword: string | undefined = $state();
    let retypedNewPassword: string | undefined = $state();

    const update = async (e: Event) => {
        e.preventDefault();

        if (currentPassword === undefined) {
            return addToast("error", "Enter your current password", 3000);
        }

        if (newPassword === undefined) {
            return addToast("error", "Enter your new password", 3000);
        }

        if (retypedNewPassword != newPassword) {
            return addToast("error", "Your passwords doesn't match", 3000);
        }

        let request = await Client.request("POST", "/accounts/@me/change-password", { new_password: newPassword, password: currentPassword });
        if (!request.ok) {
            return addToast("error", await request.text(), 3000);
        }

        reset(true);
        dialogOpen = false;
    };

    const reset = (b: boolean) => {
        if (b) {
            newPassword = undefined;
            currentPassword = undefined;
        }
    }
</script>

<Dialog.Root bind:open={dialogOpen} onOpenChange={(v) => reset(!v)}>
    <Dialog.Trigger class="flex flex-row items-center gap-3 w-[800px] h-[55px] bg-sexy-lighter-black rounded-xl text-weep-gray hover:text-white duration-75">
        <Lock size="25px" class="ml-3"/>

        <div class="flex flex-col items-start">
            <div class="text-xs">
                PASSWORD
            </div>
            <div class="text-md font-bold">{"*".repeat(10)}</div>
        </div>

        <div class="ml-auto mr-3">
            <Pencil size="20px" />
        </div>
    </Dialog.Trigger>

    <Dialog.Portal>
        <Dialog.Overlay
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
        />

        <Dialog.Content class="bg-dark-bg rounded-3xl fixed left-[50%] top-[50%] max-w-[500px] max-h-[450px] w-full h-full z-50 translate-x-[-50%] translate-y-[-50%] 
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border border-tertiary-bg">
            <form onsubmit={update} class="flex flex-col items-center justify-center gap-8 m-8">

                <div class="w-full">
                    <div class="text-lg font-bold text-weep-gray tracking-tighter">
                        NEW PASSWORD
                    </div>
                    <input type="password" autocomplete="new-password" required class="h-[55px] w-full bg-sexy-lighter-black rounded-xl text-white" placeholder={$currentActor!.username} bind:value={newPassword}/>
                </div>

                <div class="w-full">
                    <div class="text-lg font-bold text-weep-gray tracking-tighter">
                        CONFIRM PASSWORD
                    </div>
                    <input type="password" autocomplete="new-password" required class="h-[55px] w-full bg-sexy-lighter-black rounded-xl text-white" bind:value={retypedNewPassword}/>
                </div>

                <div class="w-full">
                    <div class="text-lg font-bold text-weep-gray tracking-tighter">
                        CURRENT PASSWORD
                    </div>
                    <input type="password" autocomplete="current-password" required class="h-[55px] w-full bg-sexy-lighter-black rounded-xl text-white" bind:value={currentPassword}/>
                </div>

                <button class="px-4 text-white rounded-4xl py-0.5 hover:scale-105 hover:bg-fourth-bg bg-secondary-bg border border-tertiary-bg duration-500">
                    Save
                </button>
            </form>
            <Dialog.Close class="fixed right-0 top-0 flex flex-col justify-start mt-4 mr-4 group">
                <X size="20px" />
            </Dialog.Close>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>