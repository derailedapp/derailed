{#snippet borderB()}
    <div class="border-b border-sexy-lighter-gray w-full h-[1px]"></div>
{/snippet}

<div class="flex flex-col items-center gap-2 pt-2 w-[80px] 
backdrop-blur-3xl rounded-3xl border-[1px] my-2 ml-2 z-[997] bg-sexy-red-black/60 border-sexy-lighter-black">

    <button onclick={() => {}} class="rounded-3xl transition-all ease-in-out
        duration-250 max-h-12 max-w-12 w-full h-full
        hover:bg-sexy-lighter-black/70 hover:rounded-xl">

        <img src="/derailed.png" alt="derailed logo" class="h-7 mx-auto">
    </button>

    <div class="flex flex-col overflow-y-auto gap-3 no-scrollbar">
        {@render borderB()}
    </div>
</div>