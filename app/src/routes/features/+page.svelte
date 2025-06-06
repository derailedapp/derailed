<script>
    import Header from "$lib/components/branding/Header.svelte";
</script>

<div class="bg-[url(/saturn.webp)] inset-0 absolute blur-2xl bg-center bg-cover -z-10"></div>

<Header />

<div class="flex flex-col justify-center items-center w-full h-screen">
    <div class="grid justify-center items-center grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col justify-center items-center gap-6 bg-sexy-lighter-black/60 rounded-xl p-8 w-full md:w-[400px] h-[232px] text-center">
            <h1 class="font-bold text-4xl bg-gradient-to-r from-blurple to-blurple/60 bg-clip-text text-transparent">Comfort</h1>
            <p class="font-medium text-gray-300 leading-relaxed">
                We have a sleek, modern, more intuitively designed UI made specifically to get you chatting as much as you'd like
            </p>
        </div>

        <div class="flex flex-col justify-center items-center gap-6 bg-sexy-lighter-black/60 rounded-xl p-8 w-[400px] h-[232px] text-center">
            <h1 class="font-bold text-4xl bg-gradient-to-r from-blurple to-blurple/60 bg-clip-text text-transparent">Stupid Fast</h1>
            <p class="font-medium text-gray-300 leading-relaxed">
                Derailed is created with tools that are fast and efficient, never leaving you waiting on spinners
            </p>
        </div>

        <div class="flex flex-col justify-center items-center gap-6 bg-sexy-lighter-black/60 rounded-xl p-8 w-[400px] h-[232px] text-center">
            <h1 class="font-bold text-4xl bg-gradient-to-r from-blurple to-blurple/60 bg-clip-text text-transparent">Secure</h1>
            <p class="font-medium text-gray-300 leading-relaxed">
                Our open nature allows security folks to detect vulnerabilities before they even get to you
            </p>
        </div>

        <div class="flex flex-col justify-center items-center gap-6 bg-sexy-lighter-black/60 rounded-xl p-8 w-[400px] h-[232px] text-center">
            <h1 class="font-bold text-4xl bg-gradient-to-r from-blurple to-blurple/60 bg-clip-text text-transparent">Open and Free</h1>
            <p class="font-medium text-gray-300 leading-relaxed">
                We are an open platform. You can check Derailed from top to bottom and assure yourself that we don’t steal or use your data maliciously
            </p>
        </div>
    </div>

    <div class="flex flex-col justify-center items-center gap-8 mt-[80px]">
        <h1 class="font-bold text-xl">What are you waiting for!?</h1>
        <a href="https://app.derailed.top" class="bg-blurple/80 hover:bg-blurple hover:scale-105 transition-all duration-500 p-4 rounded-lg font-bold">Try Derailed, It's free.</a>
    </div>
</div>