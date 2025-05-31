<script lang="ts">
let {
	channelId,
	username,
	avatarUrl,
	selected = false,
}: {
	channelId: BigInt;
	username: string;
	avatarUrl: string;
	selected?: boolean;
} = $props();
</script>

<!--TODO: Add logic-->

<a href={`/app/channels/${channelId}`} class="flex flex-row border-blurple items-center gap-3 hover:bg-sexy-lighter-black/70 hover:backdrop-blur-3xl p-4 py-1.5 my-1 transition-all duration-100 w-full" class:bg-primary={selected} class:border-l-2={selected}>
    <img class="rounded-full h-9 w-9" src={avatarUrl} alt={`@${username}`} />

    <div class="text-weep-gray truncate" class:text-whitekinda={selected}>
        {username}
    </div>
</a>