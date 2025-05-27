<script lang="ts">
    let { username, avatarUrl, selected = false }: {
        username: string,
        avatarUrl: string,
        selected?: boolean
    } = $props();
</script>

<!--TODO: Add logic-->

<button class="flex flex-row items-center gap-3 hover:bg-blurple/45 p-2 rounded-2xl transition-all duration-100 w-full" class:bg-blurple={selected}>
    <img class="rounded-full h-[40px]" src={avatarUrl} alt={`@${username}`} />

    <div class="font-bold truncate">
        {username}
    </div>
</button>