<script lang="ts">
    import type { APIClient } from "$lib/api";
    import Pin from "$lib/components/login/Pin.svelte";
    import { addToast, currentAccount } from "$lib/state";
    import { Dialog } from "bits-ui";
    import { EnvelopeSimple, Pencil, X } from "phosphor-svelte";

    let {
        dialogOpen = $bindable(),
        Client,
    }: {
        dialogOpen: boolean;
        Client: APIClient;
    } = $props();

    let emailSent = $state(false);
    let code: string = $state("");

    let currentPassword: string | undefined = $state();
    let newEmail: string = $derived($currentAccount!.email);
    
    const update = async (e: Event) => {
        e.preventDefault();

        if (emailSent) {
            let request = await Client.request("POST", "/accounts/@me/change-email/confirm", { code: Number(code) });
            if (!request.ok) {
                return addToast("error", await request.text(), 3000);
            }

            reset(true);
            dialogOpen = false;
            return;
        }

        if (currentPassword === undefined) {
            return addToast("error", "Enter your current password", 3000);
        }

        if (newEmail === $currentAccount!.email) {
            return addToast("error", "You haven't changed the email", 3000);
        }

        let request = await Client.request("POST", "/accounts/@me/change-email/request", { email: newEmail, password: currentPassword });
        if (!request.ok) {
            return addToast("error", await request.text(), 3000);
        }

        emailSent = true;
        console.log(emailSent)
    };

    const reset = (b: boolean) => {
        if (b) {
            newEmail = $currentAccount!.email;
            currentPassword = undefined;
            code = "";
            emailSent = false;
        }
    }
</script>

<Dialog.Root bind:open={dialogOpen} onOpenChange={(v) => reset(!v)}>
    <Dialog.Trigger class="flex flex-row items-center gap-3 w-[800px] h-[55px] bg-sexy-lighter-black rounded-xl text-weep-gray hover:text-white duration-75">
        <EnvelopeSimple size="25px" class="ml-3"/>

        <div class="flex flex-col items-start">
            <div class="text-xs">
                EMAIL
            </div>
            <div class="flex flex-row gap-2">
                <div class="text-md font-bold">{$currentAccount!.email}</div>
            </div>
        </div>

        <div class="ml-auto mr-3">
            <Pencil size="20px" />
        </div>
    </Dialog.Trigger>

    <Dialog.Portal>
        <Dialog.Overlay
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
        />

        <Dialog.Content class="bg-dark-bg rounded-3xl fixed left-[50%] top-[50%] max-w-[500px] max-h-[375px] w-full h-full z-50 translate-x-[-50%] translate-y-[-50%] 
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border border-tertiary-bg">
            <form onsubmit={update} class="flex flex-col items-center justify-center gap-8 m-8">
                {#if emailSent}
                    <Pin bind:value={code} />

                    <button type="button" class="text-xs" onclick={() => {emailSent = false}}>
                        Resend Email
                    </button>

                    <button class="px-4 text-white rounded-4xl py-0.5 hover:scale-105 hover:bg-fourth-bg bg-secondary-bg border border-tertiary-bg duration-500">
                        Confirm
                    </button>
                {:else}
                    <div class="w-full">
                        <div class="text-lg font-bold text-weep-gray tracking-tighter">
                            NEW EMAIL
                        </div>
                        <input autocomplete="email" type="email" required class="h-[55px] w-full bg-sexy-lighter-black rounded-xl text-white" bind:value={newEmail} placeholder={$currentAccount!.email}/>
                    </div>

                    <div class="w-full">
                        <div class="text-lg font-bold text-weep-gray tracking-tighter">
                            PASSWORD
                        </div>
                        <input autocomplete="current-password" required type="password" class="h-[55px] w-full bg-sexy-lighter-black rounded-xl text-white" bind:value={currentPassword}/>
                    </div>

                    <button type="button" class="text-xs mr-auto" onclick={() => {emailSent = true}}>
                        I already have a code.
                    </button>

                    <button class="px-4 text-white rounded-4xl py-0.5 hover:scale-105 hover:bg-fourth-bg bg-secondary-bg border border-tertiary-bg duration-500">
                        Request
                    </button>
                {/if}
            </form>
            <Dialog.Close class="fixed right-0 top-0 flex flex-col justify-start mt-4 mr-4 group">
                <X size="20px" />
            </Dialog.Close>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>