<script lang="ts">
import "../app.css";

import ToastManager from "$lib/components/ToastManager.svelte";

let { children } = $props();
</script>

<ToastManager />
{@render children()}
