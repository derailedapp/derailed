<script lang="ts">
import Sidebar from "$lib/components/Sidebar.svelte";
import { goto } from "$app/navigation";
import { onMount } from "svelte";

let { children } = $props();

const isLoading = false;

$effect(() => {
	if (!localStorage.getItem("token")) {
		goto("/login");
	}
});
</script>

<div class="h-screen w-full overflow-hidden bg-cover bg-[url('/app-bg.jpg')]">
    <div class="flex h-full w-full flex-row">
        {#if isLoading}
            <div>Derailed is loading</div>
        {:else}
            <Sidebar />
            {@render children()}
        {/if}
    </div>
</div>