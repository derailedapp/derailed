<script lang="ts">
import { page } from "$app/state";

import { List, X } from "phosphor-svelte";

const headerItems = [
    { href: "/about", name: "About", current: () => page.url.pathname === "/about" },
    { href: "/features", name: "Features", current: () => page.url.pathname === "/features" },
    { href: "/news", name: "Newsroom", current: () => page.url.pathname === "/news" },
    { href: "/terms", name: "Terms", current: () => page.url.pathname === "/terms" },
    { href: "/privacy", name: "Privacy", current: () => page.url.pathname === "/privacy" },
]

let showMenu = false;
</script>

<div class="hidden md:fixed md:flex flex-row justify-center items-center h-24 w-full">
    <div class="flex flex-row justify-center items-center gap-18 p-8">
        <a href="/" class="w-full">
            <img src="/derailed-text.svg" class="w-48" alt="logo">
        </a>

        <div class="flex flex-row justify-center items-center gap-2">
            {#each headerItems as item}
                <a href={item.href} class:current={item.current}
                class="hover:bg-black/30 duration-200 px-3 py-0.5 rounded-full">{item.name}</a>
            {/each}
        </div>

        <a href="/app" class="py-2 px-8 hover:bg-white hover:text-black border-2 border-white transition-all duration-150 rounded-full">
            Login
        </a>
    </div>
</div>

<div class="md:hidden fixed flex flex-row items-center w-full backdrop-blur-3xl">
    <a href="/"><img src="/derailed-text.svg" class="w-36 h-fit m-6" alt="logo"/></a>

    <button class="ml-auto m-6" onclick={() => showMenu = true}>
        <List class="size-5" />
    </button>
</div>

{#if showMenu}
    <div class="fixed inset-0 flex flex-col h-full w-full z-50 bg-blurple overflow-hidden">
        <div class="flex-1 flex flex-col">
            <div class="md:hidden fixed flex flex-row items-center w-full">
                <a href="/"><img src="/derailed-text.svg" class="w-36 h-fit m-6" alt="logo"/></a>

                <button class="ml-auto m-6" onclick={() => showMenu = false}>
                    <X class="size-5" />
                </button>
            </div>
        </div>

        <div class="flex-1 flex flex-col justify-center items-center gap-2">
            {#each headerItems as item}
                <a href={item.href} class="h-[50px] w-[90%] flex items-center justify-center">{item.name}</a>
                <div class="border-b w-[90%] h-px"></div>
            {/each}
        </div>

        <div class="flex-1 flex items-end">
            <a href="/app" class="py-8 m-8 w-full border transition-all duration-150 flex justify-center items-center rounded-full">
                Login
            </a>
        </div>
    </div>
{/if}