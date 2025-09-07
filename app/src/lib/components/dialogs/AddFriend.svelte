<script lang="ts">
import { Dialog } from "bits-ui";
import { addToast } from "$lib/state";
let username: string | undefined = $state();
let open: boolean | undefined = $state(false);
import Client from "$lib/api";

async function onSubmit(e: SubmitEvent) {
	e.preventDefault();

	Client.request("POST", `/users/${username}/follow`, undefined).catch(
		(reason) => {
			console.error(reason);
			addToast("error", reason, 4000);
		},
	);
}
</script>

<Dialog.Root bind:open={open}>
    <Dialog.Trigger class="cursor-pointer round-button">
        <button type="button" class="px-4 z-[3] text-white rounded-4xl py-0.5 hover:scale-105 hover:bg-fourth-bg bg-secondary-bg border border-weep-gray duration-500">
            Add Friend
        </button>
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50"
        />
        <Dialog.Content class="rounded-lg fixed left-[50%] top-[50%] z-[100] w-full translate-x-[-50%] translate-y-[-50%] py-8 px-12 gap-2 max-w-[450px]
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div class="bg-secondary-bg border border-weep-gray rounded-4xl h-full p-10 w-[450px]">
                <form onsubmit={onSubmit} class="flex flex-col items-center justify-start z-[3] text-white gap-2">
                    <h1 class="font-semibold text-xl">Add a Friend</h1>
                    <p class="text-sm mb-2">You can use your friends username to add them on Derailed.</p>
                    <input type="text" bind:value={username} placeholder="username" name="username" autocomplete="off" required minlength="4" maxlength="32" class="rounded-xl w-full placeholder:text-fifth-bg bg-transparent border border-weep-gray outline-none focus:ring-0 my-3">

                    <button type="submit" class="p-1.5 text-white hover:bg-blurple transition duration-500 ease-in-out hover:scale-105 border border-weep-gray rounded-4xl h-full w-full mt-2 flex justify-center">
                        Send Friend Request
                    </button>
                </form>
            </div>
            <Dialog.Close />
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>