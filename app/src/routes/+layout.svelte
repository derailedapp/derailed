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

import { setupConvexAuth } from "@mmailaender/convex-auth-svelte/sveltekit";
import { PUBLIC_CONVEX_URL } from "$env/static/public";

// Import data from +layout.server.ts
let { children, data } = $props();

// Set up authentication (automatically initializes Convex client)
setupConvexAuth({
	getServerState: () => data.authState,
	convexUrl: PUBLIC_CONVEX_URL,
});
</script>

<ToastManager />
{@render children()}
