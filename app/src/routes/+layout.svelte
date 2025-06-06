<script lang="ts">
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
