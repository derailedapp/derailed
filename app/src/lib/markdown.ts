import { remark } from "remark";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

// Function for unscrewing a bunch of markdown counterparts.
// the following function is sourced from the Eludris project, and is under the MIT license.
// The license can be found at https://github.com/eludris/client/blob/c236c37e5ab7462779a8318f8becfd5f01e30863/LICENSE
// original source location: https://github.com/eludris/client/blob/e4a588a621615ad642f56f7aaa60b79f3a23509b/src/lib/markdown.ts#L77-L160
export function unScrewHtml(html: string): string {
	html = html
		.trim()
		// I've spent so much time trying to fix this, thanks to revolt I finally managed to get it working
		.replace(/^(<\/?[a-zA-Z0-9]+>)(.*$)/gm, "\u200E$&")
		// "properly" render empty blockquotes
		.replace(/^> +$/gm, "> \u200E")
		// force whitespace for blockquotes
		.replace(/^([^\\]|)>([^>\s]|$)/gm, "\\$&")
		// better code-block escaping
		.replace(/\\```/gm, "\\`\\`\\`")
		// make empty block quote lines actually render
		.replace(/\\```/gm, "\\`\\`\\`")
		// make blockquotes only one line long
		.replace(/^>.*$/gm, "$&\n\n")
		// solve weird bug with whitespace getting magically removed sometimes
		.replace(/`( +[^`\s]+? +)`/gm, "` $1 `")
		// ensure backslashes escaping mentions etc are retained
		.replace(/\\([:@<>#|])/gm, "\\\\$1");

	// we have to reassign to get the updated string
	// ensure ``` s have a new line before and after them
	// html = html.replace(/(\S+)```(\S+ ?)?/gm, (_, p1, p2, offset) => {
	//   p1 = p1 ?? '';
	//   p2 = p2 ?? '';
	//   offset += p1.length;

	//   console.log("hello")
	//   console.log("hi", p1, p2, offset);

	//   const codeFencesBefore = html.substring(0, offset).split('```').length - 1;
	//   const lastCodeFence = !html.substring(offset + 3).includes('```');
	//   if (codeFencesBefore % 2 == 1 && html[offset - 1] != '\n') {
	//     return `${p1}\n\`\`\`${p2 ? `\n${p2}` : ''}`;
	//   }
	//   if (codeFencesBefore % 2 == 0 && !lastCodeFence && html[offset + p2.length + 3] != '\n') {
	//     return `${p1 ? `${p1}\n` : ''}\`\`\`${p2}\n`;
	//   }
	//   return `\`\`\`${p2}`;
	// });

	// number list supremacy
	html = html.replace(/^(\+ |\* )/gm, (match, _, offset) => {
		let preList = html.substring(0, offset);
		if (
			preList.split("```").length % 2 == 1 &&
			preList.replace(/```/gm, "").split("`").length % 2 == 1
		) {
			return `\\${match}`;
		}
		return match;
	});

	// As per the markdown spec, having one newline does not result in a line break. having two
	// means that you get two seperate <p> elements. This makes adding newlines to your messages
	// really wack as you have to escape them. To fix this we escape them all pre-parsing.
	html = html.replace(/[^\\]\n+/gm, (match, offset) => {
		const preNewline = html.substring(0, offset);
		const currentLine = preNewline
			.substring(preNewline.lastIndexOf("\n"))
			.trim();
		if (/^(?:>|#|- |\d+\. )/.test(currentLine)) return match;
		if (
			(preNewline.split(/\n```\S?/gm).length + +preNewline.startsWith("```")) %
				2 ==
				1 &&
			preNewline.replace(/```/gm, "").split("`").length % 2 == 1 &&
			preNewline.split("$$").length % 2 == 1 &&
			preNewline.replace(/$$/gm, "").split("`").length % 2 == 1
		) {
			return match.substring(0, 2) + match.substring(2).replace(/\n/g, "\\\n");
		}
		return match;
	});

	// add trailing line after lists to make them not merge
	html = html.replace(/^((?:\d+\. |- ).+)(\n[^- ]|$)/g, "$1\n$2");

	// trailing ```s leading to an entire code block is...annoying
	if (html.includes("```")) {
		const lastCodeFence = html.lastIndexOf("```");
		const preCodeFence = html.substring(0, lastCodeFence);
		if (
			(preCodeFence.split(/\n```\S?/gm).length +
				+preCodeFence.startsWith("```")) %
				2 ==
			1
		) {
			html = preCodeFence + "\\`\\`\\`" + html.substring(lastCodeFence + 3);
		}
	}
	return html;
}

export const processor = remark()
	.use(remarkGfm, {
		singleTilde: false,
	})
	.use(remarkRehype)
	.use(rehypeKatex, { trust: false })
	.use(rehypeSanitize)
	.use(rehypeStringify, { allowDangerousHtml: true });
