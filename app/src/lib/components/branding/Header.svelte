<script lang="ts">
import { page } from "$app/state";

</script>

<div class="hidden md:fixed md:flex flex-row justify-center items-center h-24 w-full">
    <div class="flex flex-row justify-center items-center gap-18 p-8">
        <a href="/" class="w-full">
            <img src="/derailed-text.svg" class="w-48" alt="logo">
        </a>

        <div class="flex flex-row justify-center items-center gap-2">
            <a href="/about" class:current={page.url.pathname === "/about"} 
            class="hover:bg-aside/70 duration-200 px-3 py-0.5 rounded-full">About</a>

            <a href="/features" class:current={page.url.pathname === "/features"} 
            class="hover:bg-aside/70 duration-200 px-3 py-0.5 rounded-full">Features</a>

            <a href="/news" class:current={page.url.pathname.startsWith("/news")} 
            class="hover:bg-aside/70 duration-200 px-3 py-0.5 rounded-full">Newsroom</a>

            <a href="/terms" class:current={page.url.pathname === "/terms"} 
            class="hover:bg-aside/70 duration-200 px-3 py-0.5 rounded-full">Terms</a>

            <a href="/privacy" class:current={page.url.pathname === "/privacy"} 
            class="hover:bg-aside/70 duration-200 px-3 0.5 rounded-full">Privacy</a>
        </div>

        <a href="/app" class="py-2 px-8 hover:bg-blurple border-2 border-blurple transition-all duration-150 rounded-full">
            Login
        </a>
    </div>
</div>
