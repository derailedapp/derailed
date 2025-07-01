<script lang="ts">
import "$lib/rt";

import Sidebar from "$lib/components/Sidebar.svelte";
import { goto } from "$app/navigation";
import { isLoading } from "$lib/state";

let { children } = $props();

$effect(() => {
	if (!localStorage.getItem("token")) {
		goto("/login");
	}
});
</script>

<div class="h-screen w-full overflow-y-hidden bg-cover bg-secondary-bg">
    <div class="flex h-full w-full flex-row">
        {#if $isLoading}
            <div>Derailed is loading</div>
        {:else}
            <Sidebar />
            {@render children()}
        {/if}
    </div>
</div>