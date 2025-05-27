<script>
    import User from "$lib/components/User.svelte";
    import Server from "$lib/components/Server.svelte";

    import { Gear } from "phosphor-svelte";
</script>

{#snippet borderB()}
    <div class="border-b border-white w-full h-[1px]"></div>
{/snippet}

<!--TODO: Add logic-->
<div class="bg-[url(/home-bg.jpg)] h-screen w-full bg-center bg-cover">
    <div class="flex h-full w-full flex-row">
        <div class="h-full flex flex-col">
            <div class="flex h-full w-full">
                <div class="flex flex-col items-center gap-2 pt-2 w-[80px] 
                backdrop-blur-3xl rounded-3xl border-[1px] my-2 ml-2 z-[999] bg-sexy-red-black/40 border-sexy-lighter-black">

                    <button onclick={() => {}} class="bg-sexy-lighter-black rounded-full flex 
                        justify-center items-center transition-all 
                        duration-250 max-h-12 max-w-12 w-full h-full
                        hover:bg-blurple/60">

                        <img src="/derailed.png" alt="derailed logo" class="h-8">
                    </button>

                    <div class="flex flex-col overflow-y-auto gap-3 no-scrollbar">
                        {@render borderB()}

                        <Server serverName="Server 1" avatarUrl="https://picsum.photos/200"/>
                        <Server serverName="Server 2" avatarUrl="https://picsum.photos/300"/>
                        <Server serverName="Server 3" avatarUrl="https://picsum.photos/400"/>
                        <Server serverName="Server 4" avatarUrl="https://picsum.photos/500"/>
                    </div>
                </div>

                <div class="flex flex-col w-[260px] backdrop-blur-3xl rounded-3xl border-[1px] m-2 bg-sexy-red-black/40 border-sexy-lighter-black">
                    <div class="m-2 overflow-y-auto">
                        <User selected username="ananasmoe" avatarUrl="https://avatars.githubusercontent.com/u/132799819" />
                        <User username="THEGOLDENPRO" avatarUrl="https://avatars.githubusercontent.com/u/66202304" />
                        <User username="VincentRPS" avatarUrl="https://avatars.githubusercontent.com/u/82736662" />
                        <User username="elenakrittik" avatarUrl="https://avatars.githubusercontent.com/u/77104725" />
                        <User username="EmmmaTech" avatarUrl="https://avatars.githubusercontent.com/u/50607143" />
                        <User username="Lulalaby" avatarUrl="https://avatars.githubusercontent.com/u/14029133" />
                        <User username="spifory" avatarUrl="https://avatars.githubusercontent.com/u/80943664" />
                    </div>
                </div>
            </div>

            <div class="flex h-[90px] w-[345px] backdrop-blur-3xl rounded-3xl border-[1px] m-2 bg-sexy-red-black/40 border-sexy-lighter-black">
                <div class="flex flex-row justify-center items-center gap-2 p-4 self-end w-full">
                    <img src="https://avatars.githubusercontent.com/u/132799819" class="rounded-xl h-12" alt="ananas">
                    <div class="flex flex-col">
                        <h1 class="font-bold text-sm">@ananasmoe</h1>
                        <p class="text-xs text-gray-500">I love men</p>
                    </div>

                    <div class="flex ml-auto">
                        <Gear weight="fill" class="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-1 backdrop-blur-3xl rounded-3xl border-[1px] my-2 mr-2 bg-sexy-red-black/40 border-sexy-lighter-black">
            
        </div>
    </div>
</div>