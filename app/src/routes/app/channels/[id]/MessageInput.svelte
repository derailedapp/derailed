<script lang="ts">
import {
	Composer,
	ContentEditable,
	convertToMarkdownString,
} from "svelte-lexical";
import { theme } from "svelte-lexical/dist/themes/default";
import EmojiPicker from "./EmojiPicker.svelte";

let { channelId, channelName }: { channelId: string; channelName: string } =
	$props();

let element: Element | undefined = $state();
let composer: Composer | undefined = $state();

async function onKey(event: KeyboardEvent) {
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
	<div class="flex flex-row justify-center px-4 py-3 font-light w-full m-6 max-h-[800px] text-white rounded-md bg-inps">
		<div 
			onkeyup={onKey} 
			role="textbox" 
			tabindex="0" 
			aria-keyshortcuts="Enter" 
			aria-multiline="true" 
			class="w-full text-white"
		>
			<ContentEditable />
		</div>
		<div class="flex justify-center items-end pb-0.5">
			<EmojiPicker composer={composer} />
		</div>
	</div>
</Composer>
