<script lang="ts">
import AddFriend from "$lib/components/AddFriend.svelte";

// @ts-ignore
import UserPop from "$lib/components/UserPop.svelte";
import { currentPrivateChannelId, currentActor } from "$lib/state";
import { HandWaving } from "phosphor-svelte";

currentPrivateChannelId.set(undefined);
</script>

<div class="w-full m-2 glass-wrapper round-corners">
    <div class="glass-effect"></div>
    <div class="glass-tint"></div>
    <div class="glass-shine"></div>
    <div class="w-full py-1 flex z-[3]">
        <div class="w-full h-[58px] border-b border-white flex items-center gap-3 pl-7">
            <HandWaving color="#fff" weight="fill" height="22" width="22" />
            <div class="text-white">
                Friends
            </div>
            <div class="text-weep-gray/50 font-black">•</div>
            <AddFriend />
        </div>
        <div class="pt-14 w-full flex items-center">
            
        </div>
    </div>
</div>

<UserPop user={$currentActor!} />
