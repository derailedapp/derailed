<script lang="ts">
import {
	Composer,
	ContentEditable,
	convertToMarkdownString,
	RichTextPlugin,
	$getRoot as getRoot,
	HistoryPlugin,
	PlaceHolder,
} from "svelte-lexical";
import { theme } from "svelte-lexical/dist/themes/default";
import EmojiPicker from "./EmojiPicker.svelte";

let { channelId, channelName }: { channelId: string; channelName: string } =
	$props();

let composer: Composer | undefined = $state();

async function onKey(event: KeyboardEvent) {
	event.preventDefault();
	const editor = composer!.getEditor();
	if (event.key == "Enter" && !event.shiftKey) {
		let content = editor
			.read(() => {
				return convertToMarkdownString();
			})
			.trim();
		if (content == "") {
			return;
		}
		editor.update(() => {
			getRoot().clear();
		});

		//await client.mutation(api.messages.createInPrivateChannel, {
		//	channelId: channelId as Id<"channels">,
		//	content,
		//});
	}
}
</script>

<Composer initialConfig={{
	theme: theme,
	namespace: channelId,
    nodes: [],
    onError: (error: Error) => {
      throw error;
    }
}} bind:this={composer}>
	<div class="flex flex-row relative min-h-[56px] justify-center px-4 py-3 font-light w-full max-h-[450px] text-white rounded-4xl bg-secondary-bg border-t border-tertiary-bg">
		<div 
			onkeyup={onKey} 
			role="textbox" 
			tabindex="0" 
			aria-keyshortcuts="Enter" 
			aria-multiline="true" 
			class="w-full text-white m-0 relative max-w-full flex-auto overflow-y-auto"
		>
			<ContentEditable className="h-auto outline-0 focus:ring-0 block relative" />
			<PlaceHolder className="text-weep-gray overflow-hidden top-1/18 absolute select-none whitespace-nowrap inline-block pointer-events-none">Message #{channelName}</PlaceHolder>
		</div>
		<RichTextPlugin />
		<HistoryPlugin />

		<div class="flex justify-center items-end pb-1.5">
			<EmojiPicker composer={composer} />
		</div>
	</div>
</Composer>
