<script lang="ts">
import { api } from "$convex/_generated/api";
    import AddFriend from "$lib/components/AddFriend.svelte";

// @ts-ignore
import UserPop from "$lib/components/UserPop.svelte";
import { currentPrivateChannelId } from "$lib/state";
import { useQuery } from "convex-svelte";
    import { HandWaving } from "phosphor-svelte";

currentPrivateChannelId.set(undefined);
let currentUserQuery = useQuery(api.users.getCurrentProfile, {});
let currentUser = $derived(currentUserQuery?.data);
</script>

<div class="w-full h-full bg-primary flex">
    <div class="h-[58px] w-full border-b border-guild-aside flex items-center gap-3 pl-7">
        <HandWaving color="#a0a0a5" weight="fill" height="22" width="22" />
        <div class="text-white">
            Friends
        </div>
        <div class="text-weep-gray/50 font-black">•</div>
        <AddFriend />
    </div>
    <div class="pt-14 w-full flex items-center">
        
    </div>
</div>

<UserPop user={currentUser!} />
