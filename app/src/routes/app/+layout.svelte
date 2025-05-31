<script lang="ts">
import "$lib/gateway";
import Sidebar from "$lib/components/Sidebar.svelte";

let { children } = $props();
</script>

<div class="h-screen w-full overflow-hidden">
    <div class="flex h-full w-full flex-row">
        <Sidebar />

        {@render children()}
    </div>
</div>