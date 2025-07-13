<script>
    import UserPop from "$lib/components/UserPop.svelte";
import { Popover } from "bits-ui";
let { children, user } = $props();

</script>
<Popover.Root>
    <Popover.Trigger>
        {@render children()}
    </Popover.Trigger>
    <Popover.Portal>
        <Popover.Content sideOffset={8}>
            <UserPop user={user} />
        </Popover.Content>
    </Popover.Portal>
</Popover.Root>