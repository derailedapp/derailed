<script lang="ts">
import { Dialog, Tabs } from "bits-ui";

import { NotePencil, SignOut, Gear } from "phosphor-svelte";

import { addToast } from "$lib/state";

import { CropType } from "$lib/state";
import Cropper from "./Cropper.svelte";
import { goto } from "$app/navigation";
import { useQuery } from "convex-svelte";
import { api } from "$lib/convex/_generated/api";

let banner: File | undefined = $state();
let avatar: File | undefined = $state();

const currentUserQuery = useQuery(api.users.getCurrentProfile, {});
const currentUser = $derived(currentUserQuery.data);
const emailQuery = useQuery(api.users.getEmail, {});

let settingsSet: boolean = $state(false);
let newUsername: string = $state("");
let newDisplayName: string = $state("");
let newEmail: string = $state("");
let currentPassword: string | undefined = $state();

let bannerInput: HTMLInputElement | undefined = $state();
let avatarInput: HTMLInputElement | undefined = $state();

$effect(() => {
	if (
		!settingsSet &&
		!currentUserQuery.isLoading &&
		currentUser &&
		!emailQuery.isLoading &&
		emailQuery.data
	) {
		newUsername = currentUser.username;
		newDisplayName = currentUser.displayName || "";
		newEmail = emailQuery.data;
	}
});

let crop: { type: CropType; image: string } | null = $state(null);

const getBanner = () => {
	if (banner) {
		return URL.createObjectURL(banner);
	} else if (currentUser?.bannerId) {
		return currentUser.bannerUrl;
	}

	return null;
};

const getAvatar = () => {
	if (avatar) {
		return URL.createObjectURL(avatar);
	} else if (currentUser?.avatarId) {
		return currentUser.avatarUrl;
	}

	return "/default_pfp.webp";
};

const onSubmit = async (e: Event) => {
	e.preventDefault();

	const assetsPayload: { avatar?: string; banner?: string } = {};
	const mePayload: {
		email?: string;
		username?: string;
		display_name?: string;
	} = {};

	if (avatar) {
		assetsPayload.avatar = await fileToDataURI(avatar);
	}

	if (banner) {
		assetsPayload.banner = await fileToDataURI(banner);
	}

	if (newUsername != currentUser?.username) {
		mePayload.username = newUsername;
	}

	if (newEmail != emailQuery.data && currentPassword) {
		mePayload.email = newEmail;
	} else if (newEmail != emailQuery.data && currentPassword === undefined) {
		return addToast(
			"error",
			"To change your email, you need to type your password.",
			3000,
		);
	}

	if (newDisplayName != (currentUser?.displayName || "")) {
		mePayload.display_name = newDisplayName;
	}

	if (assetsPayload) {
		const resp = await fetch(
			import.meta.env.VITE_API_URL + "/users/@me/assets",
			{
				method: "PATCH",
				body: JSON.stringify(assetsPayload),
				headers: {
					Authorization: localStorage.getItem("token")!,
					"Content-Type": "application/json",
				},
			},
		);
	}

	if (mePayload) {
		const resp = await fetch(import.meta.env.VITE_API_URL + "/users/@me", {
			method: "PATCH",
			body: JSON.stringify(mePayload),
			headers: {
				Authorization: localStorage.getItem("token")!,
				"Content-Type": "application/json",
			},
		});
	}
};

const fileToDataURI = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
};

const setCrop = async (
	e: Event & { currentTarget: EventTarget & HTMLInputElement },
	type: CropType,
) => {
	const file = URL.createObjectURL(e.currentTarget.files![0]);

	crop = {
		type: type,
		image: file,
	};
};

const cropped = (newImage: File, type: CropType) => {
	if (type === CropType.Banner) {
		banner = newImage;
	} else {
		avatar = newImage;
	}

	crop = null;
};

const reset = (reset: boolean) => {
	if (reset) {
		banner = undefined;
		avatar = undefined;

		newUsername = currentUser!.username;
		newDisplayName = currentUser!.displayName || "";
		newEmail = emailQuery!.data!;
	}
};

const logout = async () => {
	const resp = await fetch(import.meta.env.VITE_API_URL + "/logout", {
		method: "POST",
		headers: {
			Authorization: localStorage.getItem("token")!,
		},
	});

	if (resp.status === 204) {
		localStorage.removeItem("token");
		await goto("/login");
	}
};
</script>

<Dialog.Root onOpenChange={(v) => reset(!v)}>
    <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" class="hidden" onchange={(e) => {setCrop(e, CropType.Banner)}} bind:this={bannerInput}>
    <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" class="hidden" onchange={(e) => {setCrop(e, CropType.Avatar)}} bind:this={avatarInput}>

    <Dialog.Trigger class="ml-auto p-2 rounded-sm bg-aside group border border-guild-aside hover:bg-primary transition duration-400 ease-in-out">
        <Gear weight="fill" class="w-5 h-5 text-weep-gray group-hover:text-white transition-colors duration-100" />
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
        />
        <Dialog.Content class="bg-aside rounded-lg fixed left-[50%] top-[50%] z-50 w-[1000px] h-[800px] translate-x-[-50%] translate-y-[-50%] 
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <Tabs.Root value="myaccount" class="flex h-full w-full flex-row">
                <Tabs.List class="w-[290px] h-full bg-guild-aside rounded-l-lg flex justify-end">
                    <div class="flex flex-col gap-1 mr-2 mt-6 ml-auto">
                        <div class="flex flex-row font-bold">
                            USER SETTINGS
                        </div>
                        <Tabs.Trigger 
                            value="myaccount"
                            class="py-4 w-[200px] flex mt-5 relative rounded-sm
                            before:absolute before:-left-4 before:top-0 before:h-full before:w-1 
                            before:bg-transparent text-[15px] data-[state=active]:before:bg-blurple">

                            <h1 class="ml-2">My Account</h1>
                        </Tabs.Trigger>

                        <button onclick={logout} class="data-[state=active]:bg-aside/40 transition-colors duration-800 rounded-sm
                        py-1.5 p-3 w-[200px] flex items-center text-red-300 hover:text-white text-sm hover:bg-red-600/20 mt-auto mb-4 mr-1">
                            <h1 class="text-[15px]">Log Out</h1>
                            <SignOut weight="bold" class="ml-auto mr-2 h-[17px] w-[17px]"/>
                        </button>
                    </div>
                </Tabs.List>

                <Tabs.Content value="myaccount" class="flex flex-col w-full h-full">
                    <form class="h-full w-full" onsubmit={onSubmit}>
                        <div class="flex flex-row w-full h-[90%] pl-6 pr-6 pt-12 overflow-y-auto gap-8">
                            <div class="flex flex-col pl-8 pt-8 w-1/2 gap-10">
                                <section>
                                    <div class="font-bold text-sm text-weep-gray tracking-tighter mb-8">
                                        DISPLAY NAME
                                    </div>

                                    <input 
                                        style="box-shadow: none;" 
                                        placeholder="No Display Name" 
                                        bind:value={newDisplayName} 
                                        class="bg-transparent appearance-none w-full border-0 border-b border-b-sexy-red-gray" 
                                    />
                                </section>

                                <section>
                                    <div class="font-bold text-sm text-weep-gray tracking-tighter mb-8">
                                        USERNAME
                                    </div>

                                    <input 
                                        required 
                                        style="box-shadow: none;" 
                                        bind:value={newUsername} 
                                        onkeypress={(e) => {if (e.key === " ") { e.preventDefault() }}} 
                                        class="bg-transparent appearance-none w-full border-0 border-b border-b-sexy-red-gray" 
                                    />
                                </section>

                                <section>
                                    <div class="font-bold text-sm text-weep-gray tracking-tighter mb-8">
                                        EMAIL
                                    </div>

                                    <input
                                        required
                                        type="email"
                                        style="box-shadow: none;"
                                        bind:value={newEmail}
                                        class="bg-transparent appearance-none w-full border-0 border-b border-b-sexy-red-gray"
                                    />
                                </section>

                                <section>
                                    <button class="font-semibold text-sm px-4 py-2 bg-blurple rounded-md">
                                        Change Password
                                    </button>
                                </section>
                            </div>

                            <div class="flex flex-col items-center pr-8 pt-8 gap-12 w-1/2">
                                <div class="font-bold text-sm text-weep-gray tracking-tighter text-center">
                                    PROFILE PICTURE
                                </div>
                                <button class="relative group" onclick={() => avatarInput?.click()}>
                                    <img src={getAvatar()} class="size-[12rem] rounded-full opacity-100 group-hover:opacity-70 mx-auto transition-all duration-200" alt="me">

                                    <span class="opacity-0 group-hover:opacity-200
                                        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 duration-200">
                                        <NotePencil class="w-6 h-6" />
                                    </span>
                                </button>

                                <div class="font-bold text-sm text-weep-gray tracking-tighter text-center">
                                    BANNER
                                </div>
                                <button class="relative group flex" onclick={() => bannerInput?.click()}>
                                    {#await getBanner() then url}
                                        {#if url == null}
                                            <div class="w-[350px] h-[130px] bg-guild-aside"></div>
                                        {:else}
                                            <img src={getBanner()} class="w-[350px] h-[130px] opacity-100 group-hover:opacity-70 mx-auto transition-all duration-200 object-cover bg-center" alt="me">
                                        {/if}

                                    {/await}

                                    <span class="opacity-0 group-hover:opacity-200
                                        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 duration-200">
                                        <NotePencil class="w-6 h-6" />
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div class="h-[10%] w-full bg-sexy-red-black rounded-br-lg flex items-center justify-end">
                            {#if newEmail != emailQuery?.data}
                                <div class="mr-auto ml-8 w-1/2">
                                    <input
                                        required
                                        type="password"
                                        placeholder="Enter current password"
                                        style="box-shadow: none;"
                                        bind:value={currentPassword}
                                        class="bg-transparent appearance-none w-full border-0 border-b border-b-sexy-red-gray"
                                    />
                                </div>
                            {/if}
                            <button type="submit" class="mr-8 bg-blurple py-1 px-8 rounded-sm">
                                Save
                            </button>
                        </div>
                    </form>
                </Tabs.Content>
            </Tabs.Root>
            {#if crop}
                <section class="bg-[#0b0b0d] fixed left-[50%] top-[50%] z-[999] w-full h-full translate-x-[-50%] translate-y-[-50%]">
                    <div class="flex flex-col justify-center items-center h-full">
                        <Cropper
                            type={crop.type}
                            image={crop.image}
                            cropped={cropped}
                            exit={() => crop = null}
                        />
                    </div>
                </section>
            {/if}
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>