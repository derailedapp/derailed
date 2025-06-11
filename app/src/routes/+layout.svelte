<script lang="ts">
import "@fontsource/inter/100";
import "@fontsource/inter/200";
import "@fontsource/inter/300";
import "@fontsource/inter/400";
import "@fontsource/inter/500";
import "@fontsource/inter/600";
import "@fontsource/inter/700";
import "@fontsource/inter/800";
import "@fontsource/inter/900";
import "../app.css";

import ToastManager from "$lib/components/ToastManager.svelte";

let { children } = $props();
</script>

<ToastManager />
{@render children()}
