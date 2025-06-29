<script lang="ts">
    import Header from "$lib/components/branding/Header.svelte";
	import type { PageData } from "./$types";

    let { data }: { data: PageData }  = $props();
</script>

<div class="overflow-y-hidden">
    <Header />

	<div class="flex flex-col gap-12 justify-center items-center min-h-[calc(100vh-75px)] mt-[75px] md:min-h-[calc(100vh-96px)] md:mt-[96px] w-full">
		<div class="markdown-branding text-pretty flex flex-col gap-2 max-w-4xl py-8">
			{@html data.markdown}
		</div>
	</div>
</div>