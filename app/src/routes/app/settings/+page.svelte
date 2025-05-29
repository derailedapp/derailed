<script lang="ts">
import { Tabs } from "bits-ui";

import {
	User,
	IdentificationBadge,
	NotePencil,
	SignOut,
} from "phosphor-svelte";
</script>

<div class="bg-[#0b0b0d] h-screen w-full bg-center bg-cover p-4">
    <Tabs.Root value="myaccount" class="flex h-full w-full flex-row gap-2">
        <Tabs.List class="w-[250px] backdrop-blur-3xl rounded-2xl border border-sexy-lighter-black/50 bg-sexy-red-black/60 p-4 flex flex-col gap-4">
            <img src="/derailed-text.svg" class="h-8 w-fit mx-auto" alt="derailed logo">

            <div class="w-full h-[1px] border-b border-sexy-lighter-black"></div>

            <div class="flex flex-col items-center gap-4">
                <Tabs.Trigger value="myaccount" class="w-full py-3 px-4 rounded-lg flex items-center gap-2
                           hover:bg-slate-700/30 
                           data-[state=active]:bg-slate-700/60 data-[state=active]:text-white
                           transition-all duration-200 text-sexy-gray hover:text-white text-center">
                    <User class="w-5 h-5" />
                    My Account
                </Tabs.Trigger>

                <Tabs.Trigger value="profile" class="w-full py-3 px-4 rounded-lg flex items-center justify-start gap-2
                           hover:bg-slate-700/30 
                           data-[state=active]:bg-slate-700/60 data-[state=active]:text-white
                           transition-all duration-200 text-sexy-gray hover:text-white text-center">
                    <IdentificationBadge class="w-5 h-5" />
                    Profile
                </Tabs.Trigger>
            </div>

            <div class="mt-auto border-t pt-2 border-sexy-lighter-black">
                <button 
                    class="w-full py-3 px-4 rounded-lg flex items-center justify-start gap-2
                        hover:bg-slate-700/30 
                        data-[state=active]:bg-slate-700/60 data-[state=active]:text-white
                        transition-all duration-200 text-sexy-gray hover:text-white text-center">
                    <SignOut class="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </Tabs.List>

        <Tabs.Content value="myaccount" class="flex flex-col flex-1 backdrop-blur-3xl rounded-3xl border-[1px] bg-sexy-red-black/60 border-sexy-lighter-black">
            <div class="flex flex-row items-center ml-4 mt-2">
                <img src="https://avatars.githubusercontent.com/u/132799819" class="rounded-xl w-12 h-12" alt="me">    
                <p class="p-4 text-2xl font-bold">My Account</p>
            </div>

            <div class="flex flex-row justify-center items-center gap-8 h-screen">
                <div class="bg-sexy-black/30 p-5 rounded-xl border border-sexy-lighter-black w-[400px] h-[86px]">
                    <div class="flex items-center justify-center h-full">
                        <div class="flex-1">
                            <h2 class="font-medium text-white">E-Mail Address</h2>
                            <p class="text-sexy-gray text-sm truncate">ananas@ananas.moe</p>
                        </div>
                        <button class="bg-sexy-gray/20 hover:bg-sexy-gray/30 text-white px-4 py-1 rounded-lg 
                        transition-all duration-150 flex items-center gap-2">
                            <NotePencil />
                            Edit
                        </button>
                    </div>
                </div>

                <div class="bg-sexy-black/30 p-5 rounded-xl border border-sexy-lighter-black w-[400px] h-[86px]">
                    <div class="flex items-center justify-center h-full">
                        <div class="flex-1">
                            <h2 class="font-medium text-white">Password</h2>
                        </div>
                        <button class="bg-sexy-gray/20 hover:bg-sexy-gray/30 text-white px-4 py-1 rounded-lg 
                        transition-all duration-150 flex items-center gap-2">
                            <NotePencil />
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </Tabs.Content>
    </Tabs.Root>
</div>