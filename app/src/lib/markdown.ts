import remarkBreaks from "remark-breaks";
import { remark } from "remark"
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

export const processor = remark()
	.use(remarkBreaks)
	.use(remarkGfm, {
		singleTilde: false,
	})
	.use(remarkRehype)
	.use(rehypeKatex, { trust: false })
	.use(rehypeSanitize)
	.use(rehypeStringify, { allowDangerousHtml: true });
