import remarkBreaks from "remark-breaks";
import { unified } from "unified";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import remarkNewlineToBreak from "./remarkToNewLine";

export const processor = unified()
	.use(remarkParse)
	.use(remarkGfm, {
		singleTilde: false,
	})
	.use(remarkNewlineToBreak)
	.use(remarkRehype)
	.use(rehypeKatex, { trust: false })
	.use(rehypeSanitize)
	.use(rehypeStringify);
