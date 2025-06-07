<script>
import Header from "$lib/components/branding/Header.svelte";
import { onMount } from "svelte";

const featureItems = [
    { header: "Comfort", content: "We have a sleek, modern, more intuitively designed UI made specifically to get you chatting as much as you'd like" },
    { header: "Stupid Fast", content: "Derailed is created with tools that are fast and efficient, never leaving you waiting on spinners" },
    { header: "Secure", content: "Our open nature allows security folks to detect vulnerabilities before they even get to you" },
    { header: "Open and Free", content: "We are an open platform. You can check Derailed from top to bottom and assure yourself that we don’t steal or use your data maliciously" }
]

onMount(() => {
    document.body.style.backgroundColor = "#5B77DC";
})
</script>

<Header />

<div class="flex flex-col justify-center items-center w-full h-screen pt-[80px] md:pt-[100px]">
    {#each featureItems as item}
        <div class="flex-1 flex flex-row m-1 items-center justify-center w-full rounded-2xl gap-8">
            <img src="/catThumbsUp.webp" class="w-48">

            <div class="flex flex-col">
                <h1 class="font-bold text-2xl text-white">{item.header}</h1>

                <p class="text-white">{item.content}</p>
            </div>
        </div>
    {/each}
</div>
