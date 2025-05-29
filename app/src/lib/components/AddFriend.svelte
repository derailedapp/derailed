<script lang="ts">
import { Plus } from "phosphor-svelte";
import { Dialog } from "bits-ui";
import { addToast } from "$lib/state";
let username: string | undefined = $state();
let open: boolean | undefined = $state(false);

async function onSubmit(e: SubmitEvent) {
	e.preventDefault();
	console.log(localStorage.getItem("token"));

	const resp = await fetch(
		import.meta.env.VITE_API_URL + "/users/" + username + "/follow",
		{
			method: "POST",
			headers: {
				Authorization: localStorage.getItem("token")!,
			},
		},
	);

	if (resp.status === 201) {
		open = false;
	} else {
		const detail = (await resp.json()).detail;

		console.error(detail);
		addToast("error", detail, 4000);
	}
}
</script>

<Dialog.Root bind:open={open}>
    <Dialog.Trigger class="cursor-pointer">
        <Plus color="#a0a0a5" class="h-5 w-5" />
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay 
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[998] bg-black/30 backdrop-blur-sm"
        />
        <Dialog.Content class="rounded-2xl outline-hidden fixed left-[50%] top-[50%] z-[9999] w-full translate-x-[-50%] translate-y-[-50%] border border-sexy-lighter-black py-8 px-12 max-w-[450px] bg-sexy-red-black/80">
            <form onsubmit={onSubmit} class="flex flex-col items-center justify-start text-white gap-2">
                <h1 class="font-semibold text-lg">Add a Friend</h1>
                <p class="text-sm">Place the username of the person you wanna friend request!</p>

                <input type="text" bind:value={username} required minlength="4" maxlength="32" class="rounded-lg w-full bg-transparent border border-sexy-lighter-black outline-none focus:ring-0 my-3">

                <button type="submit" class="w-full bg-blurple p-3 rounded-lg font-semibold">
                    Send Friend Request
                </button>
            </form>
            <Dialog.Close />
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>