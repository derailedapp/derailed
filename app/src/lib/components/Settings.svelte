<script lang="ts">
import "$lib/gateway";
import { Dialog, Tabs } from "bits-ui";

import { User, X, NotePencil, SignOut, Gear } from "phosphor-svelte";

import { type Profile, type Account } from "$lib/models";
import { currentUser } from "$lib/state";

let banner: FileList | undefined = $state();
let avatar: FileList | undefined = $state();

let newUsername: string = $state("");
let newDisplayName: string = $state("");
let newEmail: string = $state("");

let bannerInput: HTMLInputElement | undefined = $state();
let avatarInput: HTMLInputElement | undefined = $state();

let currentUserData: { profile: Profile; account: Account } | null =
	$state(null);

currentUser.subscribe((data) => {
    currentUserData = data;
    if (data) {
        newUsername = data!.profile.username;
        newDisplayName = data!.profile.display_name || "";
        newEmail = data!.account.email;
    }
});

const getBanner = () => {
    if (banner) {
        return URL.createObjectURL(banner[0]);
    } else if ($currentUser?.profile.banner) {
        return import.meta.env.VITE_CDN_URL + "/banners/" + $currentUser?.profile.banner;
    }

    return null;   
}

const getAvatar = () => {
    if (avatar) {
        return URL.createObjectURL(avatar[0]);
    } else if ($currentUser?.profile.avatar) {
        return import.meta.env.VITE_CDN_URL + "/avatars/" + $currentUser?.profile.avatar;
    }

    return "/default_pfp.webp";   
}

const onSubmit = async (e: Event) => {
    e.preventDefault();
    const payload: { avatar?: string; banner?: string; username?: string; email?: string; display_name?: string; } = {};

    if (avatar) {
        payload.avatar = await fileToDataURI(avatar[0]);
    }

    if (banner) {
        payload.banner = await fileToDataURI(banner[0]);
    }

    if (newUsername != currentUserData?.profile.username) {
        payload.username = newUsername;
    }

    if (newEmail != currentUserData?.account.email) {
        payload.email = newEmail;
    }

    if (newDisplayName != currentUserData?.profile.display_name) {
        payload.display_name = newDisplayName;
    }

    await fetch(
		import.meta.env.VITE_API_URL + "/users/@me/assets",
		{
			method: "PATCH",
            body: JSON.stringify(payload),
			headers: {
				Authorization: localStorage.getItem("token")!,
                "Content-Type": "application/json",
			},
		},
	);
}

const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
</script>

<Dialog.Root>
    <input type="file" accept="image/png, image/jpeg, image/webp" bind:files={banner} class="hidden" bind:this={bannerInput}>
    <input type="file" accept="image/png, image/jpeg, image/webp" bind:files={avatar} class="hidden" bind:this={avatarInput}>

    <Dialog.Trigger class="ml-auto">
        <Gear weight="fill" class="w-5 h-5 text-sexy-gray hover:text-white transition-colors duration-100" />
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Content class="bg-[#0b0b0d] fixed left-[50%] top-[50%] z-50 w-full h-full translate-x-[-50%] translate-y-[-50%]">
            <Tabs.Root value="myaccount" class="flex h-full w-full flex-row gap-2">
                <Tabs.List class="w-[360px] backdrop-blur-3xl rounded-2xl border border-sexy-lighter-black/50 bg-sexy-red-black/60 p-4 flex flex-col gap-4 my-2 ml-2">
                    <img src="/derailed-text.svg" class="h-8 w-fit mx-auto" alt="derailed logo">

                    <div class="flex flex-row justify-center items-center gap-2 p-3 w-full">
                        <img src="https://avatars.githubusercontent.com/u/132799819" class="rounded-full h-10" alt="ananas">
                        <div class="flex flex-col">
                            <h1>@{currentUserData?.profile.username}</h1>
                            <p class="text-sm text-sexy-gray">This is a placeholder</p>
                        </div>
                    </div>

                    <div class="w-full h-[1px] border-b border-sexy-lighter-black"></div>

                    <div class="flex flex-col items-center gap-4">
                        <Tabs.Trigger value="myaccount" class="w-full py-3 px-4 rounded-lg flex items-center gap-2
                                hover:bg-sexy-lighter-black/70 
                                data-[state=active]:bg-sexy-lighter-black/40
                                data-[state=active]:text-white
                                transition-all duration-200 text-sexy-gray hover:text-white text-center">
                            <User class="w-5 h-5" />
                            Public Profile
                        </Tabs.Trigger>
                    </div>

                    <div class="mt-auto border-t pt-2 border-sexy-lighter-black">
                        <button 
                            class="w-full py-3 px-4 rounded-lg flex items-center justify-start gap-2
                                hover:bg-sexy-lighter-black/70
                                data-[state=active]:bg-sexy-lighter-black/40 data-[state=active]:text-white
                                transition-all duration-200 text-sexy-gray hover:text-white text-center">
                            <SignOut class="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </Tabs.List>

                <form onsubmit={onSubmit} class="flex flex-col flex-1 backdrop-blur-3xl rounded-3xl border-[1px] bg-sexy-red-black/60 border-sexy-lighter-black my-2 mr-2">
                    <Dialog.Close class="absolute self-end mr-4 mt-4">
                        <X class="w-6 h-6" />
                    </Dialog.Close>

                    <Tabs.Content value="myaccount">
                        <div class="flex flex-row items-center ml-4 mt-2">
                            {#await getAvatar() then url}
                                <img src={url} class="rounded-2xl size-12" alt="me">                            
                            {/await}
                            <p class="p-4 text-2xl font-bold">Public Profile</p>
                        </div>

                        <div class="flex flex-row justify-center items-center gap-8">
                            <div class="p-5 rounded-2xl w-[1000px] h-[900px]">
                                <div class="flex flex-col h-full gap-4">
                                    <button class="relative group" onclick={() => bannerInput?.click()}>
                                        {#await getBanner() then url}
                                            {#if url === null}
                                                <div class="bg-slate-700 w-full h-[150px] rounded-4xl group-hover:opacity-70 transition-all duration-150"></div>
                                            {:else}
                                                <img src={url} alt="banner" class="w-full h-[150px] rounded-lg group-hover:opacity-70 transition-all duration-150 bg-center bg-cover">
                                            {/if}
                                        {/await}
                                    
                                        <span class="hidden group-hover:block group-hover:opacity-100 transition-all 
                                        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                            <NotePencil class="w-6 h-6" />
                                        </span>
                                    </button>

                                    <div class="flex flex-row absolute top-[12rem] ml-2">
                                        <button class="relative group" onclick={() => avatarInput?.click()}>
                                            {#await getAvatar() then url}
                                                <img
                                                    class="size-[7rem] rounded-4xl object-cover border-2 border-sexy-lighter-black group-hover:opacity-70 transition-all"
                                                    src={url}
                                                    alt="avatar"
                                                />
                                            {/await}

                                            <span class="hidden group-hover:block group-hover:opacity-100 transition-all 
                                            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <NotePencil class="w-6 h-6" />
                                            </span>
                                        </button>

                                        <h1 class="self-end mb-5 ml-3 text-4xl font-bold">{currentUserData?.profile.display_name || currentUserData?.profile.username}</h1>
                                    </div>


                                    <div class="flex flex-col justify-center items-center h-full w-full rounded-lg gap-6">
                                        <div class="flex flex-row justify-center items-center w-[80%] p-4 rounded-lg h-[80px]">
                                            <div class="flex w-full gap-2 flex-col">
                                                <h2 class="font-bold text-white">Display Name</h2>
                                                <input class="w-full bg-sexy-lighter-black/70 focus:ring-0 rounded-xl" bind:value={newDisplayName} maxlength="32" minlength="4" />
                                            </div>
                                        </div>

                                        <div class="flex flex-row justify-center items-center w-[80%] p-4 rounded-lg h-[80px]">
                                            <div class="flex w-full gap-2 flex-col">
                                                <h2 class="font-bold text-white">Username</h2>
                                                <input class="w-full bg-sexy-lighter-black/70 rounded-xl" bind:value={newUsername} maxlength="32" minlength="4" />
                                            </div>
                                        </div>

                                        <div class="flex flex-row justify-center items-center w-[80%] p-4 rounded-lg h-[80px]">
                                            <div class="flex w-full gap-2 flex-col">
                                                <h2 class="font-bold text-white">Email</h2>
                                                <input class="w-full bg-sexy-lighter-black/70 rounded-xl" bind:value={newEmail} maxlength="32" minlength="4" />
                                            </div>
                                        </div>

                                        <button class="bg-blurple/85 hover:bg-blurple/65 text-white px-4 rounded-4xl 
                                            transition-all duration-150 items-center gap-2 py-1">
                                                Update profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tabs.Content>
                </form>
            </Tabs.Root>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>