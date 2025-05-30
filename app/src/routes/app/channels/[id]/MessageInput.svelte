<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { Editor } from "@tiptap/core";
import Text from "@tiptap/extension-text";
import Paragraph from "@tiptap/extension-paragraph";
import Document from "@tiptap/extension-document";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension, markInputRule, markPasteRule } from "@tiptap/core";

let element: Element;
let editor: Editor;
const Newline = Extension.create({
	name: "newline",
	addKeyboardShortcuts() {
		return {
			"Shift-Enter": () =>
				this.editor
					.chain()
					.newlineInCode()
					.createParagraphNear()
					.liftEmptyBlock()
					.splitBlock()
					.run(),
		};
	},
});

onMount(() => {
	editor = new Editor({
		element: element,
		extensions: [
			Document,
			Text,
			Paragraph,
			Newline,
			History,
			Placeholder.configure({
				placeholder: "I swear I had something in mind...",
			}),
		],
		content: "",
		onTransaction: () => {
			// force re-render so `editor.isActive` works as expected
			editor = editor;
		},
	});
});

onDestroy(() => {
	editor?.destroy();
});
</script>

<div bind:this={element} class="px-4 py-1.5 w-full max-h-[580px] text-white/95"></div>
