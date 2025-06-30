import { processor } from "$lib/markdown";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch("/policies/guidelines.md");
	if (!response.ok) throw new Error("Failed to load guidelines");
	const markdown = await response.text();

	return {
		markdown: String(await processor.process(markdown)),
	};
};
