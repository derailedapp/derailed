<script lang="ts">
import { X, Info, WarningCircle, CheckCircle } from "phosphor-svelte";
import { fly } from "svelte/transition";

let { type, children, kill } = $props();
</script>

<article class="flex flex-row justify-center items-center py-4 w-full rounded-lg" 
    class:bg-green-400={type == "success"}
    class:bg-blue-400={type == "info"}
    class:bg-red-400={type == "error"}
    transition:fly={{ y: -200, duration: 150 }}
    >
    <i class="ml-4">
        {#if type == "info"}
            <Info class="size-5" />
        {:else if type == "success"}
            <CheckCircle class="size-5" />
        {:else}
            <WarningCircle class="size-5"/>
        {/if}
    </i>

    <h1 class="flex-1 ml-4">
        {@render children()}
    </h1>

    <button class="mr-4 cursor-pointer" onclick={() => kill()}>
        <X class="size-5" />
    </button>
</article>