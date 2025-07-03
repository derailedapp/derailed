<script lang="ts">
import Client, { type Actor } from "$lib/api";
import moment from "moment-timezone";
import { decodeTime } from "ulidx";

let {
	user,
	round = false,
	padTop = false,
}: { user: Actor; round?: boolean; padTop?: boolean } = $props();
</script>

<div class="w-[600px] h-auto m-0.5 rounded-4xl">
    <div class="flex flex-col items-center gap-2 z-[3] h-auto text-white w-full" class:rounded-xl={round}>
        <div class="w-full flex border bg-dark-bg border-tertiary-bg rounded-4xl flex-col pb-1">
            <div>
                <div class="flex flex-col w-full items-center justify-center">
                    {#if !user?.banner_id}
                        <div class="bg-blurple w-full h-[130px] rounded-t-4xl z-[5]"></div>
                    {:else}
                        <img src={Client.getCDNUrl("banners", user.banner_id)} alt="banner" class="w-full z-[5] h-[130px] object-cover bg-secondary-bg rounded-t-4xl">
                    {/if}
                    <div class="absolute top-[4.7rem] z-[6]">
                        {#if user?.avatar_id === null}
                            <img
                                class="size-[7rem] rounded-full object-cover group-hover:opacity-70 transition-all"
                                src={"/default_pfp.webp"}
                                alt="avatar"
                            />
                        {:else}
                            <img
                                class="size-[7rem] rounded-full object-cover group-hover:opacity-70 transition-all"
                                src={Client.getCDNUrl("avatars", user.avatar_id)}
                                alt="avatar"
                            />
                        {/if}
                    </div>

                    <div class="flex flex-col justify-center border-tertiary-bg border-t border-b w-full items-center pt-14 pb-4 select-none">
                        {#if user?.display_name}
                            <div class="font-semibold text-xl">
                                {user?.display_name}
                            </div>
                            <div>
                                {user?.username}
                            </div>
                        {:else}
                            <div class="font-semibold text-xl">
                                {user?.username}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
            <div class="flex flex-col w-full rounded-b-4xl px-6 py-4 gap-4">
                <div class="w-full select-none font-semibold">
                    About
                </div>
                <div class="w-full select-none">
                    <div class="font-semibold text-sm">
                        Member Since
                    </div>
                    <div class="text-sm">
                        {moment.unix(decodeTime(user.id) / 1000).format('MMMM Do YYYY, h:mm a')}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
