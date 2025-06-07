<script lang="ts">
    import moment from "moment-timezone";

    let { user, round = false, padTop = false } = $props();
</script>

<div class="flex flex-col w-[550px]" class:rounded-xl={round}>
    <div class="h-[58px] bg-primary border-b border-guild-aside p-4" class:hidden={padTop}></div>
    <div class="h-full w-full flex flex-col bg-mem-aside">
        <div class="bg-blurple pb-5">
            <div class="flex flex-col w-full items-center justify-center">
                {#if !user?.bannerUrl}
                    <div class="bg-guild-aside w-full h-[130px]"></div>
                {:else}
                    <img src={user.bannerUrl} alt="banner" class="w-full h-[130px] object-cover">
                {/if}
                <div class="absolute top-[9.5rem]">
                    {#if user?.avatarUrl === null}
                        <img
                            class="size-[7rem] rounded-full object-cover border-[3px] border-blurple group-hover:opacity-70 transition-all"
                            src={"/default_pfp.webp"}
                            alt="avatar"
                        />
                    {:else}
                        <img
                            class="size-[7rem] rounded-full object-cover border-[3px] border-blurple group-hover:opacity-70 transition-all"
                            src={user?.avatarUrl}
                            alt="avatar"
                        />
                    {/if}
                </div>

                <div class="flex flex-col justify-center items-center pt-20 select-none">
                    <div class="font-semibold text-xl">
                        {user?.displayName || user?.username}
                    </div>
                    <div>
                        {user?.username}
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col w-full pt-2 gap-4">
            <div class="w-full py-3 px-6 rounded-xl select-none">
                <div class="font-semibold text-sm">
                    Member Since
                </div>
                <div class="text-sm">
                    {moment.unix(Number(user?._creationTime || 0) / 1000).format('MMMM Do YYYY, h:mm a')}
                </div>
            </div>
        </div>
    </div>
</div>