<script lang="ts">
import "$lib/gateway";
import Sidebar from "./Sidebar.svelte";

let { children } = $props();
</script>

<div class="bg-[#0b0b0d] h-screen w-full overflow-hidden">
    <div class="flex h-full w-full flex-row">
        <Sidebar />

        {@render children()}
    </div>
</div>