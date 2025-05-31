import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/pages/news" }),
	schema: z.object({
		layout: z.string(),
		image: z.string(),
		timestamp: z.number(),
		title: z.string(),
		description: z.string(),
		author: z.string(),
		type: z.string(),
	}),
});

export const collections = { blog };
