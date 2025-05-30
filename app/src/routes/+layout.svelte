<script lang="ts">
import "@fontsource/figtree/300";
import "@fontsource/figtree/400";
import "@fontsource/figtree/500";
import "@fontsource/figtree/600";
import "@fontsource/figtree/700";
import "@fontsource/figtree/800";
import "@fontsource/figtree/900";
import "../app.css";

import ToastManager from "$lib/components/ToastManager.svelte";

let { children } = $props();
</script>

<ToastManager />
{@render children()}
