import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
} from 'lexical';

import {TextNode} from 'lexical';

export class EmojiNode extends TextNode {
    static getType(): string {
        return 'emoji';
    }

    static clone(node: EmojiNode): EmojiNode {
        return new EmojiNode(node.__text, node.__key);
    }

    constructor(text: string, key?: NodeKey) {
        super(text, key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = document.createElement('img');
        const inner = super.createDOM(config);

        element.setAttribute('src', `/twemoji/${this.__text.codePointAt(0)!.toString(16)}.svg`);
        element.setAttribute('width', "20px");
        element.setAttribute('height', "20px");
        element.appendChild(inner)

        return element;
    }

    updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
        const inner = dom.firstChild;
        if (inner === null) {
            return true;
        }
        super.updateDOM(prevNode, inner as HTMLElement, config);
        return false;
    }
}

export function $isEmojiNode(
  node: LexicalNode | null | undefined,
): node is EmojiNode {
    return node instanceof EmojiNode;
}

export function $createEmojiNode(
  emojiText: string,
): EmojiNode {
    const node = new EmojiNode(emojiText);
    return node;
}