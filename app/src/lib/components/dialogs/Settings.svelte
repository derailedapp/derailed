<script lang="ts">
import { Dialog, Tabs } from "bits-ui";

import { SignOut, Gear, User as UserIcon, X, Pencil, GithubLogo, Butterfly,  IdentificationBadge, XLogo } from "phosphor-svelte";
import { readAndCompressImage } from "browser-image-resizer";

import { addToast } from "$lib/state";

import { CropType } from "$lib/state";
import Cropper from "../Cropper.svelte";
import { goto } from "$app/navigation";
import { currentActor, currentAccount } from "$lib/state";
import Client from "$lib/api";
import Email from "./settings/Email.svelte";
import Password from "./settings/Password.svelte";
import Username from "./settings/Username.svelte";


let bannerInput: HTMLInputElement | undefined = $state();
let avatarInput: HTMLInputElement | undefined = $state();
let selectedTab = $state("account");

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

let banner: File | undefined = $state();
let avatar: File | undefined = $state();
let newDisplayName: string = $derived($currentActor!.display_name || "");

let usernameDialog = $state(false);
let emailDialog = $state(false);
let passwordDialog = $state(false);


const updateActor = async (e: Event) => {
	e.preventDefault();
    let hasChanges = false;
    let form = new FormData();

	if (avatar) {
		let avatarCompressed = await readAndCompressImage(avatar, {
			mimeType: "image/jpeg",
		});

        form.append("avatar", avatarCompressed);
	}

	if (banner) {
		let bannerCompressed = await readAndCompressImage(banner, {
			mimeType: "image/jpeg",
		});

        form.append("banner", bannerCompressed);
	}

    if (form.has("avatar") || form.has("banner")) {
        const request = await Client.requestForm("POST", "/users/@me/assets", form);
        if (!request.ok) {
            return addToast("error", "Failed to update avatar/banner", 3000);
        }

        currentActor.set(await request.json());
        hasChanges = true;
    }

    if (newDisplayName != ($currentActor!.display_name || "")) {
        const request = await Client.request("PATCH", "/users/@me", { display_name: newDisplayName });
        if (!request.ok) {
            return addToast("error", "Failed to update profile", 3000);
        }

        currentActor.set(await request.json());
        hasChanges = true;
    }

	reset(true);
    if (hasChanges) {
	    addToast("success", "Profile updated", 3000);
    } else {
	    addToast("error", "Nothing to change", 3000);
    }
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

        usernameDialog = false;
        emailDialog = false;
        passwordDialog = false;


		newDisplayName = $currentActor!.display_name || "";
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
        <Dialog.Content class="bg-dark-bg rounded-3xl fixed left-[50%] top-[50%] max-w-[1200px] max-h-[900px] w-full h-full z-50 translate-x-[-50%] translate-y-[-50%] 
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <Tabs.Root bind:value={selectedTab} onValueChange={() => reset(true)} class="flex flex-row h-full w-full">
                <Tabs.List class="flex justify-center w-[200px] h-full border border-tertiary-bg rounded-3xl rounded-r-none">
                    <div class="flex flex-col gap-2 mt-6 mx-3 w-full">
                        <div class="flex flex-row justify-center items-center font-bold">
                            SETTINGS
                        </div>
                        <Tabs.Trigger 
                            value="account"
                            class="py-2 mt-5 data-[state=active]:bg-aside/40 hover:bg-aside/20 duration-75 rounded-lg">
                            
                            <div class="flex flex-row items-center ml-2">
                                <UserIcon size="20px" />
                                <h1 class="text-sm ml-2">Account</h1>
                            </div>
                        </Tabs.Trigger>

                        <Tabs.Trigger 
                            value="profile"
                            class="py-2 data-[state=active]:bg-aside/40 hover:bg-aside/20 duration-75 rounded-lg">
                            
                            <div class="flex flex-row items-center ml-2">
                                <IdentificationBadge size="20px" />
                                <h1 class="text-sm ml-2">Profile</h1>
                            </div>
                        </Tabs.Trigger>

                        <button onclick={logout} class="data-[state=active]:bg-aside/40 transition-colors duration-800 rounded-sm
                        py-1 x-3 flex items-center text-red-300 hover:text-white text-sm hover:bg-red-600/20 mt-auto group">
                            <h1 class="text-[15px] ml-2">Log Out</h1>
                            <SignOut weight="bold" class="ml-auto mr-2 size-[17px] group-hover:mr-1 transition-all duration-800"/>
                        </button>

                        <div class="border-b border-tertiary-bg w-full h-px"></div>

                        <div class="flex flex-row justify-center mb-2 gap-4">
                            <a href="https://github.com/derailedapp">
                                <GithubLogo size="20px"/>
                            </a>

                            <a href="https://bsky.app/profile/derailed.top">
                                <Butterfly size="20px"/>
                            </a>

                            <a href="https://x.com/derailedapp">
                                <XLogo size="20px"/>
                            </a>
                        </div>
                    </div>
                </Tabs.List>

                <Tabs.Content value="account" class="flex flex-col items-center mt-6 w-[1000px] h-full gap-3 overflow-y-auto">
                    <h1 class="font-bold text-xl mb-5">Account</h1>

                    <div class="flex flex-row items-center gap-3 w-[800px] h-[80px] rounded-xl">
                        {#if $currentActor?.avatar_id}
                            <img src={Client.getCDNUrl("avatars", $currentActor.avatar_id)} class="ml-3 size-18 rounded-full">
                        {:else}
                            <img src="/default_pfp.webp" class="ml-3 size-18 rounded-full">
                        {/if}
                        <div class="flex flex-col items-start">
                            <p class="text-md font-bold">{$currentActor!.username}</p>
                            <p class="text-xs font-bold">{$currentActor!.id}</p>
                        </div>
                        <button onclick={() => {selectedTab = "profile"}} class="ml-auto px-4 text-white rounded-4xl py-0.5 hover:scale-105 hover:bg-fourth-bg bg-secondary-bg border border-tertiary-bg duration-500">
                            Edit Profile
                        </button>
                    </div>

                    <Username bind:dialogOpen={usernameDialog} Client={Client} />
                    <Password bind:dialogOpen={passwordDialog} Client={Client} />
                    <Email bind:dialogOpen={emailDialog} Client={Client} />
                </Tabs.Content>

                <Tabs.Content value="profile" class="flex flex-col items-center mt-6 w-[1000px] h-full gap-12 overflow-y-auto">
                    <h1 class="font-bold text-xl mb-5">Profile</h1>

                    <div class="flex flex-row items-center justify-center w-[600px]">
                        <div class="flex flex-col items-center justify-center mr-auto gap-1">
                            <div class="text-xl tracking-tighter font-bold text-weep-gray">
                                AVATAR
                            </div>

                            <button class="relative group" onclick={() => avatarInput?.click()}>
                                <img src={getAvatar($currentActor!.avatar_id)} class="size-[130px] rounded-full opacity-100 group-hover:opacity-60 mx-auto transition-all duration-200" alt="me">

                                <span class="opacity-0 group-hover:opacity-200
                                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 duration-200">
                                    <Pencil class="size-6" />
                                </span>
                            </button>
                        </div>

                        <div class="flex flex-col items-center justify-center ml-auto gap-1">
                            <div class="text-xl tracking-tighter font-bold text-weep-gray">
                                BANNER
                            </div>

                            <button class="relative group" onclick={() => bannerInput?.click()}>
                                {#await getBanner($currentActor!.banner_id) then url}
                                    {#if url == null}
                                        <div class="w-[350px] h-[130px] bg-guild-aside"></div>
                                    {:else}
                                        <img src={getBanner($currentActor!.banner_id)} class="w-[350px] h-[130px] opacity-100 group-hover:opacity-70 mx-auto transition-all duration-200 object-cover bg-center" alt="me">
                                    {/if}
                                {/await}

                                <span class="opacity-0 group-hover:opacity-200
                                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 duration-200">
                                    <Pencil class="size-6" />
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col items-center justify-center gap-4 w-[600px]">
                        <div class="text-xl tracking-tighter font-bold text-weep-gray">
                            DISPLAY NAME
                        </div>

                        <input 
                            style="box-shadow: none;" 
                            placeholder="No Display Name"
                            bind:value={newDisplayName} 
                            class="bg-transparent appearance-none w-full border-0 border-b border-b-sexy-red-gray" 
                        />
                    </div>

                    <button onclick={updateActor} class="px-4 text-white rounded-4xl py-0.5 hover:scale-105 hover:bg-fourth-bg bg-secondary-bg border border-tertiary-bg duration-500">
                        Save
                    </button>
                </Tabs.Content>

                <Dialog.Close class="fixed right-0 flex flex-col justify-start mt-6 mr-7 group">
                    <div class="border-3 border-lightest-bg rounded-full p-2 group-hover:border-white duration-200 transition-all">
                        <X size="20px" />
                    </div>
                
                    <h1 class="font-extrabold tracking-tighter">ESC</h1>
                </Dialog.Close>
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