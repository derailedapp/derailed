<script>
import { goto } from "$app/navigation";
</script>
{#snippet borderB()}
    <div class="border-b border-sexy-lighter-gray w-full h-[1px]"></div>
{/snippet}

<div class="bg-dark-bg border border-tertiary-bg w-[65px] m-0.5 rounded-3xl">
    <div class="flex flex-col items-center gap-2 pb-5 z-[3] w-full">
        <button onclick={() => goto("/app")} class="rounded-3xl transition-all ease-in-out
            duration-700 pt-[16px] h-full">

            <img src="/derailed.png" alt="derailed logo" class="h-[24px] mx-auto">
        </button>

        <div class="flex flex-col overflow-y-auto gap-3 no-scrollbar">
            {@render borderB()}
        </div>
    </div>
</div>