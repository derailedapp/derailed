<script lang="ts">
    import { Tooltip } from "bits-ui";
    import { fly } from "svelte/transition";

    let { serverName, avatarUrl }: {
        serverName: string,
        avatarUrl: string,
    } = $props();
</script>

<Tooltip.Provider>
    <Tooltip.Root delayDuration={100}>
        <Tooltip.Trigger>
            <img class="rounded-full hover:rounded-lg hover:scale-105 transition-all duration-200 h-11" src={avatarUrl} alt={serverName} />
        </Tooltip.Trigger>

        <Tooltip.Content class="w-full" side="right" sideOffset={8} forceMount>
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div {...props} transition:fly={{ duration: 150, x: "25" }}>
                            <Tooltip.Arrow class="text-blurple"/>

                            <div class="flex justify-center items-center rounded-2xl bg-blurple py-2 px-6">
                                {serverName}
                            </div>
                        </div>
                    </div>
                {/if}
            {/snippet}
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>