<script>
import { goto } from "$app/navigation";
</script>
{#snippet borderB()}
    <div class="border-b border-sexy-lighter-gray w-full h-[1px]"></div>
{/snippet}

<div class="flex flex-col items-center gap-2 pt-2 w-[80px] bg-guild-aside">

    <button onclick={() => goto("/app")} class="rounded-3xl transition-all ease-in-out
        duration-700 max-h-12 max-w-12 w-full h-full
        hover:bg-aside hover:p-1 hover:rounded-xl">

        <img src="/derailed.png" alt="derailed logo" class="h-7 mx-auto">
    </button>

    <div class="flex flex-col overflow-y-auto gap-3 no-scrollbar">
        {@render borderB()}
    </div>
</div>