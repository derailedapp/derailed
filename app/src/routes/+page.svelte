<script>
import Header from "$lib/components/branding/Header.svelte";
</script>

<div class="bg-blurple">
    <Header />

    <div class="flex flex-col justify-center items-center w-full h-screen gap-6">
        <h1 class="font-bold text-4xl text-center">It's time to ditch Discord.</h1>

        <p class="font-normal text-center max-w-xl text-lg text-white/70">
            Create your own guilds, communities, and friend groups in the comfort of a safe, secure, and intuitive interface.
        </p>
    </div>

    <div class="flex justify-center items-center bottom-0 fixed w-full">
        <a href="/features" class="group inline-flex pb-4 font-bold">
            <p>Learn more</p>
            <span class="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
        </a>
    </div>
</div>