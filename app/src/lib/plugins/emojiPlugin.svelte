<script lang="ts">
  import { TextNode } from 'lexical';
  import { EmojiNode, $createEmojiNode as createEmojiNode } from './emojiNode';
  import { onMount } from 'svelte';
  import { getEditor } from 'svelte-lexical';

  const emojiRegex = /\p{Emoji}/gu;

  const editor = getEditor();

  function findAndTransformEmoji(node: TextNode): null | TextNode {
    const text = node.getTextContent();
    const matchArr = emojiRegex.exec(text);
    
    if (matchArr === null) {
      return null;
    }
    
    const emoji = matchArr[0];
    return node.replace(createEmojiNode(emoji))
  }

  function textNodeTransform(node: TextNode): TextNode | null {
    while (node !== null) {
        if (!node.isSimpleText()) {
            return null;
        }

        let newNode = findAndTransformEmoji(node);
        return newNode
    }

    return node;
  }

  onMount(() => {
    if (!editor.hasNodes([EmojiNode])) {
      throw new Error('EmojisPlugin: EmojiNode not registered on editor');
    }

    return editor.registerNodeTransform(TextNode, textNodeTransform);
  });
</script>