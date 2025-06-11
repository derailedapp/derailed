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

let { channelId, channelName }: { channelId: string; channelName: string; } =
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
	<div class="flex flex-row relative justify-center px-4 py-3 font-light w-full m-6 max-h-[800px] text-white rounded-md bg-inps">
		<div 
			onkeyup={onKey} 
			role="textbox" 
			tabindex="0" 
			aria-keyshortcuts="Enter" 
			aria-multiline="true" 
			class="w-full text-white m-0 relative max-w-full flex-auto resize-y"
		>
			<ContentEditable className="h-auto outline-0 focus:ring-0 block relative" />
			<PlaceHolder className="text-weep-gray overflow-hidden top-1/13 absolute select-none whitespace-nowrap inline-block pointer-events-none">Message #{channelName}</PlaceHolder>
		</div>
		<RichTextPlugin />
		<HistoryPlugin />

		<div class="flex justify-center items-end pb-0.5">
			<EmojiPicker composer={composer} />
		</div>
	</div>
</Composer>
