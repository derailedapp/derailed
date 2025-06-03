import { Node, nodeInputRule } from "@tiptap/core";
import * as emoji from "node-emoji";
import twemoji from "@twemoji/api";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		emojiReplacer: {
			insertEmoji: (emoji: string) => ReturnType;
		};
	}
}

const UNICODE_REGEX = new RegExp(/\p{Extended_Pictographic}/gu);
const EMOTICON_REGEX = new RegExp(/:[a-zA-Z0-9_+-]+:/g);

const EmojiReplacer = Node.create({
	name: "emojiReplacer",
	group: "inline",
	inline: true,
	selectable: false,
	atom: false,
	linebreakReplacement() {
		return undefined;
	},
	addAttributes() {
		return {
			emoji: {
				default: null,
				parseHTML: (element) => element.children[0].getAttribute("alt"),
				renderHTML: (attributes) => {
					if (!attributes.emoji) {
						return {};
					}

					let codepoint: string | undefined;

					if (UNICODE_REGEX.test(attributes.emoji)) {
						codepoint = attributes.emoji.codePointAt(0)!.toString(16);
					} else {
						codepoint = emoji
							.get(attributes.emoji)
							?.codePointAt(0)!
							.toString(16);
					}

					if (codepoint === undefined) {
						return {};
					}
					return {
						alt: "emoji",
						src: `/twemoji/${codepoint}.svg`,
						class: "h-5 w-auto inline",
					};
				},
			},
		};
	},
	parseHTML() {
		return [{ tag: "span[data-emoji-replacer]" }];
	},
	renderHTML({ HTMLAttributes }) {
		return ["span", { "data-emoji-replacer": "" }, ["img", HTMLAttributes]];
	},
	renderText({ node }) {
		return node.attrs.emoji;
	},
	addOptions() {
		return {
			allowGapCursor: false,
		};
	},
	addCommands() {
		return {
			insertEmoji:
				(emoji) =>
				({ tr, dispatch }) => {
					const node = this.type.create({ emoji });

					if (dispatch) {
						tr.replaceRangeWith(tr.selection.from, tr.selection.to, node);
					}

					return true;
				},
		};
	},
	addKeyboardShortcuts() {
		return {
			Backspace: () => {
				this.editor.commands.first(({ commands }) => [
					() => commands.deleteSelection(),
					() => commands.joinBackward(),
					() => commands.selectNodeBackward(),
				]);

				return true;
			},
		};
	},
	addInputRules() {
		return [
			nodeInputRule({
				find: EMOTICON_REGEX,
				type: this.type,
				getAttributes: (match) => {
					return {
						emoji: match[1],
					};
				},
			}),
			nodeInputRule({
				find: UNICODE_REGEX,
				type: this.type,
				getAttributes: (match) => ({
					emoji: match[0],
				}),
			}),
		];
	},
});

export { EmojiReplacer };
