<script lang="ts">
import Sidebar from "$lib/components/Sidebar.svelte";
import { goto } from "$app/navigation";
import { useAuth } from "@mmailaender/convex-auth-svelte/sveltekit";

let { children } = $props();

const isAuth = $derived(useAuth().isAuthenticated);
const isLoading = $derived(useAuth().isLoading);

$effect(() => {
	if (!isLoading && !isAuth) {
		goto("/login");
	}
});
</script>

<div class="h-screen w-full overflow-hidden">
    <div class="flex h-full w-full flex-row">
        {#if isLoading}
            <div>Derailed is loading</div>
        {:else if isAuth}
            <Sidebar />
            {@render children()}
        {/if}
    </div>
</div>