<script lang="ts">
    let { username, avatarUrl, selected = false }: {
        username: string,
        avatarUrl: string,
        selected?: boolean
    } = $props();
</script>

<!--TODO: Add logic-->

<button class="flex flex-row items-center gap-3 hover:bg-blurple/45 p-2 rounded-2xl transition-all duration-100 w-full" class:bg-slate-400={selected}>
    <img class="rounded-xl h-[40px]" src={avatarUrl} alt={`@${username}`} />

    <div class="font-bold text-sexy-gray truncate">
        {username}
    </div>
</button>