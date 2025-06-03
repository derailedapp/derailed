<script lang="ts">
if (localStorage.getItem("token") === null) {
	goto("/login");
}

import "$lib/gateway";
import Sidebar from "$lib/components/Sidebar.svelte";
import { goto } from "$app/navigation";
import { socketOpen } from "$lib/gateway";

let { children } = $props();
</script>

<div class="h-screen w-full overflow-hidden">
    <div class="flex h-full w-full flex-row">
        {#if $socketOpen}
            <Sidebar />

            {@render children()}
        {:else}
            <div>
                Derailed is loading
            </div>
        {/if}
    </div>
</div>