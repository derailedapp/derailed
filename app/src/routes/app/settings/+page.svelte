<script lang="ts">
import { Tabs } from "bits-ui";

import {
	User,
	X,
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

        <div class="flex flex-col flex-1 backdrop-blur-3xl rounded-3xl border-[1px] bg-sexy-red-black/60 border-sexy-lighter-black">
            <button class="absolute self-end mr-4 mt-4">
                <X class="w-6 h-6" />
            </button>

            <Tabs.Content value="myaccount">
                <div class="flex flex-row items-center ml-4 mt-2">
                    <img src="https://avatars.githubusercontent.com/u/132799819" class="rounded-xl w-12 h-12" alt="me">    
                    <p class="p-4 text-2xl font-bold">My Account</p>
                </div>

                <div class="flex flex-row justify-center items-center gap-8">
                    <div class="bg-sexy-black/30 p-5 rounded-xl border border-sexy-lighter-black w-[1000px] h-[800px]">
                        <div class="flex flex-col h-full gap-4">
                            <button class="relative group">
                                <img src="https://api.soteria.social/files/7290401069329285120.webp" alt="banner" class="w-full h-fit rounded-lg group-hover:opacity-70 transition-all duration-150">
                            
                                <span class="hidden group-hover:block group-hover:opacity-100 transition-all 
                                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <NotePencil class="w-6 h-6" />
                                </span>
                            </button>

                            <div class="flex flex-row absolute top-[12rem] ml-2">
                                <button class="relative group">
                                    <img
                                        class="size-[8rem] rounded-2xl object-cover border-2 border-sexy-lighter-black group-hover:opacity-70 transition-all"
                                        src="https://avatars.githubusercontent.com/u/132799819"
                                        alt="avatar"
                                    />

                                    <span class="hidden group-hover:block group-hover:opacity-100 transition-all 
                                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <NotePencil class="w-6 h-6" />
                                    </span>
                                </button>

                                <h1 class="self-end mb-5 ml-3 text-4xl font-bold">Ananas</h1>
                            </div>

                            <div class="bg-sexy-red-black/90 flex flex-col justify-center items-center mt-18 h-full w-full rounded-lg gap-8">
                                <div class="flex flex-row justify-center items-center w-[80%] p-4 border border-sexy-lighter-black rounded-lg h-[80px]">
                                    <div class="flex-1">
                                        <h2 class="font-bold text-xl text-white">Username</h2>
                                        <p class="text-sexy-gray text-sm truncate">ananasmoe</p>
                                    </div>
                                    <button class="bg-sexy-gray/20 hover:bg-sexy-gray/30 text-white px-4 rounded-lg 
                                    transition-all duration-150 flex items-center gap-2 h-full">
                                        <NotePencil />
                                        Edit
                                    </button>
                                </div>

                                <div class="flex flex-row justify-center items-center w-[80%] p-4 border border-sexy-lighter-black rounded-lg h-[80px]">
                                    <div class="flex-1">
                                        <h2 class="font-bold text-xl text-white">Display Name</h2>
                                        <p class="text-sexy-gray text-sm truncate">Ananas</p>
                                    </div>
                                    <button class="bg-sexy-gray/20 hover:bg-sexy-gray/30 text-white px-4 rounded-lg 
                                    transition-all duration-150 flex items-center gap-2 h-full">
                                        <NotePencil />
                                        Edit
                                    </button>
                                </div>

                                <div class="flex flex-row justify-center items-center w-[80%] p-4 border border-sexy-lighter-black rounded-lg h-[80px]">
                                    <div class="flex-1">
                                        <h2 class="font-bold text-xl text-white">E-Mail Address</h2>
                                        <p class="text-sexy-gray text-sm truncate">ananas@ananas.moe</p>
                                    </div>
                                    <button class="bg-sexy-gray/20 hover:bg-sexy-gray/30 text-white px-4 py-1 rounded-lg 
                                    transition-all duration-150 flex items-center gap-2 h-full">
                                        <NotePencil />
                                        Edit
                                    </button>
                                </div>

                                <div class="flex flex-row justify-center items-center w-[80%] p-4 border border-sexy-lighter-black rounded-lg h-[80px]">
                                    <div class="flex items-center justify-center h-full w-full">
                                        <div class="flex-1">
                                            <h2 class="font-bold text-xl text-white">Password</h2>
                                        </div>
                                        <button class="bg-sexy-gray/20 hover:bg-sexy-gray/30 text-white px-4 py-1 rounded-lg 
                                        transition-all duration-150 flex items-center gap-2 h-full">
                                            <NotePencil />
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Tabs.Content>
        </div>
    </Tabs.Root>
</div>