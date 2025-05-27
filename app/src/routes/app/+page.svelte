<script>
    import User from "$lib/components/User.svelte";
    import Server from "$lib/components/Server.svelte";

    import { Users, Plus, Smiley, Gif } from "phosphor-svelte";
</script>

{#snippet borderR()}
    <div class="border-r border-sexy-lighter-black h-full w-[1px]"></div>
{/snippet}

{#snippet borderB()}
    <div class="border-b border-sexy-lighter-black w-full h-[1px]"></div>
{/snippet}

<!--TODO: Add logic-->
<div class="bg-sexy-red-black h-screen w-full">
    <div class="flex flex-row w-full h-full">
        <div class="flex flex-row w-[400px] bg-sexy-lighter-black/20 h-full">
            <div class="flex flex-col items-center w-[70px] h-full gap-1 p-2">
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
            
            {@render borderR()}

            <div class="flex-1 px-2 flex flex-col h-full">
                <button class="flex flex-row items-center gap-3 hover:bg-sexy-lighter-black p-2 rounded-2xl transition-all duration-100 w-full">
                    <Users class="h-[40px] w-[40px]"/>

                    <div class="font-bold">
                        Friends
                    </div>
                </button>

                {@render borderB()}

                <div class="flex flex-col flex-1 overflow-hidden mt-1">
                    <div class="text-center font-bold">
                        Direct Messages
                    </div>

                    <div class="flex-1 overflow-y-auto">
                        <User selected username="ananasmoe" avatarUrl="https://avatars.githubusercontent.com/u/132799819" />

                    </div>
                </div>
            </div>

            {@render borderR()}
        </div>

        <div class="flex flex-1 w-full h-full">
            <div class="flex self-end w-full gap-4 py-5 px-5 bg-sexy-lighter-black/30">
                <div class="bg-sexy-lighter-black flex flex-row w-full rounded-xl py-2">
                    <button class="flex justify-center items-center px-6">
                        <Plus class="w-5 h-5"/>
                    </button>

                    <input style="box-shadow: none;" class="bg-sexy-lighter-black w-full rounded-xl border-none" placeholder="Message @ananasmoe"/>

                    <div class="flex flex-row justify-center items-center gap-2 px-6">
                        <button>
                            <Smiley class="w-5 h-5"/>
                        </button>
                        <button>
                            <Gif class="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>