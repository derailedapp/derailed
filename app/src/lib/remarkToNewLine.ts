import { visit } from "unist-util-visit";

export default function remarkNewlineToBreak() {
	return (tree: any) => {
		visit(tree, "text", (node, index, parent) => {
			const lines = node.value.split("\n");
			if (lines.length > 1) {
				const newNodes: any[] = [];
				lines.forEach((line: any, i: number) => {
					newNodes.push({ type: "text", value: line });
					if (i < lines.length - 1) {
						newNodes.push({ type: "break" });
					}
				});
				parent.children.splice(index, 1, ...newNodes);
			}
		});
	};
}
