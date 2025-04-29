import { produceAST } from "./ast.ts";
import { tokenize } from "./lexer.ts";

export function parse(contents: string) {
	const tokens = tokenize(contents).toArray();
	const ast = produceAST(tokens);
	return ast;
}