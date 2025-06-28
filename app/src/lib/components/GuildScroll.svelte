<script>
import { goto } from "$app/navigation";
</script>
{#snippet borderB()}
    <div class="border-b border-sexy-lighter-gray w-full h-[1px]"></div>
{/snippet}

<div class="bg-dark-bg border border-tertiary-bg w-[80px] m-1 rounded-4xl">
    <div class="flex flex-col items-center gap-2 py-5 z-[3] w-full">
        <button onclick={() => goto("/app")} class="rounded-3xl transition-all ease-in-out
            duration-700 max-h-12 max-w-12 w-full h-full
            hover:bg-tertiary-bg hover:p-3 hover:rounded-full">

            <img src="/derailed.png" alt="derailed logo" class="h-7 mx-auto">
        </button>

        <div class="flex flex-col overflow-y-auto gap-3 no-scrollbar">
            {@render borderB()}
        </div>
    </div>
</div>