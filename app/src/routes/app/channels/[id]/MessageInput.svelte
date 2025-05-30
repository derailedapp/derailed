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
} from "$lib/state";

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

async function onKey(event: KeyboardEvent) {
	if (event.key == "Enter") {
		let content = editor.getText();
		const currentChannelId = get(currentPrivateChannel)!;

		let nonce = crypto
			.getRandomValues(new Uint8Array(16))
			.map((x) => x % 36)
			.join("");

		const now = Date.now();
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
			const data = await resp.json();
			console.log(data);
		});
		editor.commands.clearContent();
		channelMessages.update((v) => {
			let msgs = v.get(currentChannelId) || [];
			const currentUserData = get(currentUser);
			msgs.push({
				id: BigInt(900000000000000000000000000),
				content,
				nonce,
				author_id: currentUserData!.account.id,
				channel_id: currentChannelId,
				created_at: BigInt(now),
				last_modified_at: BigInt(now),
			});
			v.set(currentChannelId, msgs);
			return v;
		});
	}
}
</script>

<div onkeyup={onKey} role="textbox" tabindex="0" aria-keyshortcuts="Enter" aria-multiline="true" bind:this={element} class="px-4 py-1.5 w-full max-h-[580px] text-white/95"></div>
