<script lang="ts">
import { Dialog, Tabs } from "bits-ui";

import { NotePencil, SignOut, Gear, Spinner, X } from "phosphor-svelte";
import { readAndCompressImage } from "browser-image-resizer";

import { addToast } from "$lib/state";

import { CropType } from "$lib/state";
import Cropper from "./Cropper.svelte";
import { goto } from "$app/navigation";
import { currentActor, currentAccount } from "$lib/state";
import Client from "$lib/api";

let banner: File | undefined = $state();
let avatar: File | undefined = $state();

let newUsername: string = $derived($currentActor!.username);
let newDisplayName: string = $derived($currentActor!.display_name || "");
let newEmail: string = $derived($currentAccount!.email);

let currentPassword: string | undefined = $state();

let bannerInput: HTMLInputElement | undefined = $state();
let avatarInput: HTMLInputElement | undefined = $state();

let crop: { type: CropType; image: string } | null = $state(null);

const getBanner = (currentBannerId: string | null) => {
	if (banner) {
		return URL.createObjectURL(banner);
	} else if (currentBannerId) {
		return Client.getCDNUrl("banners", currentBannerId);
	}

	return null;
};

const getAvatar = (currentAvatarId: string | null) => {
	if (avatar) {
		return URL.createObjectURL(avatar);
	} else if (currentAvatarId) {
		return Client.getCDNUrl("avatars", currentAvatarId);
	}

	return "/default_pfp.webp";
};

const onSubmit = async (e: Event) => {
	e.preventDefault();

	//client.mutation(api.users.modifyProfile, {
	//    username: newUsername !== currentUser!.username ? newUsername : undefined,
	//    displayName: newDisplayName !== (currentUser!.displayName || "") ? newDisplayName : undefined,
	//})

	if (avatar) {
		//const uploadUrl = await client.mutation(api.users.getUploadURL, {});
		const compressed = await readAndCompressImage(avatar, {
			quality: 0.9,
			maxWidth: 400,
			maxHeight: 400,
			mimeType: "image/webp",
		});

		//const result = await fetch(uploadUrl, {
		//    method: "POST",
		//    headers: { "Content-Type": "image/webp" },
		//    body: compressed,
		//});

		//const { storageId } = await result.json();

		//await client.mutation(api.users.setAvatarID, { id: storageId })
	}

	if (banner) {
		//const uploadUrl = await client.mutation(api.users.getUploadURL, {});
		const compressed = await readAndCompressImage(banner, {
			quality: 0.9,
			maxWidth: 980,
			maxHeight: 400,
			mimeType: "image/webp",
		});

		//const result = await fetch(uploadUrl, {
		//    method: "POST",
		//    headers: { "Content-Type": "image/webp" },
		//    body: compressed,
		//});

		//const { storageId } = await result.json();

		//await client.mutation(api.users.setBannerID, { id: storageId })
	}

	reset(true);
	addToast("success", "Profile updated", 3000);
};

const setCrop = async (
	e: Event & { currentTarget: EventTarget & HTMLInputElement },
	type: CropType,
) => {
	const file = e.currentTarget.files![0];
	if (!["image/jpeg", "image/webp", "image/png"].includes(file.type)) {
		addToast("error", "Given file is not a image.", 3000);
		return;
	}

	const imageUrl = URL.createObjectURL(file);

	crop = {
		type: type,
		image: imageUrl,
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

		newUsername = $currentActor!.username;
		newDisplayName = $currentActor!.display_name || "";
		newEmail = $currentAccount!.email!;
	}
};

const logout = async () => {
	localStorage.removeItem("token");

	await goto("/login");
};
</script>

<Dialog.Root onOpenChange={(v) => reset(!v)}>
    <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" class="hidden" onchange={(e) => {setCrop(e, CropType.Banner)}} bind:this={bannerInput}>
    <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" class="hidden" onchange={(e) => {setCrop(e, CropType.Avatar)}} bind:this={avatarInput}>

    <Dialog.Trigger class="ml-auto p-2 rounded-xl group hover:bg-lighter-bg transition duration-400 mr-2 ease-in-out">
        <Gear weight="fill" class="w-[22px] h-[22px] text-weep-gray group-hover:text-white transition-colors duration-100" />
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
        />
        <Dialog.Content class="bg-aside rounded-lg fixed left-[50%] top-[50%] z-50 w-[1000px] h-[800px] translate-x-[-50%] translate-y-[-50%] 
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <Tabs.Root value="myaccount" class="flex h-full w-full flex-row">
                <Tabs.List class="w-[180px] h-full bg-guild-aside rounded-l-lg flex justify-end">
                    <div class="flex flex-col gap-1 mt-6 ml-auto w-[180px]">
                        <div class="flex flex-row justify-center items-center font-bold">
                            USER SETTINGS
                        </div>
                        <Tabs.Trigger 
                            value="myaccount"
                            class="py-4 w-[200px] flex mt-5 relative rounded-sm
                            before:absolute before:left-0 before:top-0 before:h-full before:w-1 
                            before:bg-transparent text-[15px] data-[state=active]:before:bg-blurple">

                            <h1 class="ml-6 text-sm">My Account</h1>
                        </Tabs.Trigger>

                        <button onclick={logout} class="data-[state=active]:bg-aside/40 transition-colors duration-800 rounded-sm
                        py-1 x-3 flex m-2 mb-4 items-center text-red-300 hover:text-white text-sm hover:bg-red-600/20 mt-auto group">
                            <h1 class="text-[15px] ml-2">Log Out</h1>
                            <SignOut weight="bold" class="ml-auto mr-2 size-[17px] group-hover:mr-1 transition-all duration-800"/>
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

                                    
                                    <div class="flex flex-row justify-center items-center gap-3">
                                        <input 
                                            style="box-shadow: none;" 
                                            placeholder="No Display Name"
                                            bind:value={newDisplayName} 
                                            class="bg-transparent appearance-none w-full border-0 border-b border-b-sexy-red-gray" 
                                        />
                                    </div>
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
                                <button type="button" class="relative group" onclick={() => avatarInput?.click()}>
                                    <img src={getAvatar($currentActor!.avatar_id)} class="size-[12rem] rounded-full opacity-100 group-hover:opacity-70 mx-auto transition-all duration-200" alt="me">

                                    <span class="opacity-0 group-hover:opacity-200
                                        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 duration-200">
                                        <NotePencil class="w-6 h-6" />
                                    </span>
                                </button>

                                <div class="font-bold text-sm text-weep-gray tracking-tighter text-center">
                                    BANNER
                                </div>
                                <button type="button" class="relative group" onclick={() => bannerInput?.click()}>
                                    {#await getBanner($currentActor!.banner_id) then url}
                                        {#if url == null}
                                            <div class="w-[350px] h-[130px] bg-guild-aside"></div>
                                        {:else}
                                            <img src={getBanner($currentActor!.banner_id)} class="w-[350px] h-[130px] opacity-100 group-hover:opacity-70 mx-auto transition-all duration-200 object-cover bg-center" alt="me">
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
                            {#if newEmail != $currentAccount?.email}
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