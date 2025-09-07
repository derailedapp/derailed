<script lang="ts">
import "$lib/rt";

import { goto } from "$app/navigation";
import { isLoading } from "$lib/state";

let { children } = $props();

$effect(() => {
	if (!localStorage.getItem("token")) {
		//goto("/login");
	}
});
</script>

<div class="h-screen overflow-y-hidden bg-white">
    <div class="flex h-full flex-row">
        {#if $isLoading}
            <div>Derailed is loading</div>
        {:else}
            {@render children()}
        {/if}
    </div>
</div>