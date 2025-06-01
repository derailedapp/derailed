<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { Editor } from "@tiptap/core";
import Text from "@tiptap/extension-text";
import Paragraph from "@tiptap/extension-paragraph";
import Document from "@tiptap/extension-document";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";
import { get } from "svelte/store";
import {
	channelMessages,
	currentPrivateChannel,
	currentUser,
	waitingForMessages,
} from "$lib/state";
import JSON from "json-bigint";
import EmojiPicker from "./EmojiPicker.svelte";

let element: Element;
let editor: Editor;
const Newline = Extension.create({
	name: "newline",
	addKeyboardShortcuts() {
		return {
			Enter: () => true,
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
				placeholder: "What's on your mind?",
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

async function onKey(event: KeyboardEvent) {
	if (event.key == "Enter" && !event.shiftKey) {
		let content = editor.getText().trim();
		if (content == "") {
			return;
		}
		const currentChannelId = get(currentPrivateChannel)!;

		let nonce = crypto
			.getRandomValues(new Uint8Array(16))
			.map((x) => x % 36)
			.join("");

		const now = Date.now();
		waitingForMessages.update((v) => {
			v.push(nonce);
			return v;
		});
		fetch(
			import.meta.env.VITE_API_URL +
				"/channels/" +
				currentChannelId.valueOf().toString() +
				"/messages",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: localStorage.getItem("token")!,
				},
				body: JSON.stringify({ content, nonce }),
			},
		).then(async (resp) => {
			const data = JSON.parse(await resp.text());
			console.log(data);
		});
		editor.commands.clearContent();
		channelMessages.update((v) => {
			let msgs = v.get(currentChannelId.toString()) || [];
			const currentUserData = get(currentUser);
			msgs.push({
				id: "900000000000000000000000000",
				content,
				nonce,
				author_id: currentUserData!.account.id,
				channel_id: currentChannelId,
				created_at: now,
				last_modified_at: now,
			});
			v.set(currentChannelId.toString(), msgs);
			return v;
		});
	}
}
</script>

<div class="flex flex-row items-center justify-center px-4 py-3 font-light w-full m-6 max-h-[800px] text-white rounded-md bg-inps">
	<div 
		onkeyup={onKey} 
		role="textbox" 
		tabindex="0" 
		aria-keyshortcuts="Enter" 
		aria-multiline="true" 
		bind:this={element} 
		class="w-full text-white"
	></div>
	<div class="flex justify-center items-end">
		<EmojiPicker />
	</div>
</div>
