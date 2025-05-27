<script lang="ts">
    let { username, avatarUrl, selected = false }: {
        username: string,
        avatarUrl: string,
        selected?: boolean
    } = $props();
</script>

<!--TODO: Add logic-->

<button class="flex flex-row items-center gap-3 hover:bg-sexy-lighter-black/70 hover:backdrop-blur-3xl p-2 py-1.5 my-1 rounded-xl transition-all duration-100 w-full" class:bg-sexy-lighter-black={selected}>
    <img class="rounded-xl h-8 w-8" src={avatarUrl} alt={`@${username}`} />

    <div class="text-sexy-gray truncate">
        {username}
    </div>
</button>