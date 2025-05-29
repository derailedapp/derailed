<script lang="ts">
import Toast from "./Toast.svelte";

import { dismissToast, toasts } from "../state";
</script>

{#if $toasts}
  <section class="absolute right-0 flex flex-col z-[9999] m-12 max-w-[350px] w-full gap-4">
    {#each $toasts as toast}
        <Toast type={toast.type} kill={() => dismissToast(toast.id)}>
            {toast.message}
        </Toast>
    {/each}
  </section>
{/if}