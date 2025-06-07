<script>
import Header from "$lib/components/branding/Header.svelte";

const featureItems = [
    { header: "Comfort", white: true, content: "We have a sleek, modern, more intuitively designed UI made specifically to get you chatting as much as you'd like" },
    { header: "Stupid Fast", white: false, content: "Derailed is created with tools that are fast and efficient, never leaving you waiting on spinners" },
    { header: "Secure", white: true, content: "Our open nature allows security folks to detect vulnerabilities before they even get to you" },
    { header: "Open and Free", white: false, content: "We are an open platform. You can check Derailed from top to bottom and assure yourself that we don’t steal or use your data maliciously" }
]
</script>

<div class="overflow-y-auto">
    <Header />

    <div class="flex flex-col w-full h-screen pt-80 md:pt-[100px] bg-white">
        {#each featureItems as item}
            <div class="bg-gray-200" class:bg-white={item.white}>
                <div class="flex flex-row items-center justify-evenly w-full p-48 rounded-2xl">
                    <img src="/catThumbsUp.webp" class="w-48">

                    <div class="flex flex-col gap-2">
                        <h1 class="text-2xl text-blurple">{item.header}</h1>

                        <p class="max-w-sm" class:text-primary={item.white} class:text-gray-600={!item.white}>{item.content}</p>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>