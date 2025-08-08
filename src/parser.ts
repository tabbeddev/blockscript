import { produceAST } from "./ast.ts";
import { tokenize } from "./lexer.ts";

export function parse(contents: string) {
	const tokens = tokenize(contents).toArray();
	// console.log(tokens);
	// Deno.exit(0);
	const ast = produceAST(tokens);
	return ast;
}
