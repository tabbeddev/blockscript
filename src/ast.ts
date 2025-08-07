import { SpecToken, type Token, TokenType } from "../types/lexer.ts";
import {
	type ASTBlockStatement,
	type ASTValues,
	ASTType,
	ASTNumber,
	ASTLiteral,
	ASTIdentifer,
	ASTCallExpression,
	ASTNode,
	ASTArrayExpression,
	ASTObjectExpression,
	ASTSelectorExpression,
	ASTMemberExpression,
	precedence,
	ASTOperators,
	ASTBinaryExpression,
	ASTVariableDeclaration,
} from "../types/ast.ts";
import { type Error, ErrorTypes } from "../types/errors.ts";
import { adv, parseColorCodes } from "./console.ts";
import { capitalize } from "./util.ts";

export function produceAST(tokens: Token[]): ASTBlockStatement {
	/**
	 * Checks the next Token for the specified token type.
	 *
	 * @returns The Token
	 * @throws When the Token doesn't match
	 */
	function expect(
		type: TokenType,
		format: string = "Unexpected Token found: <!VAL> [GN]"
	): SpecToken<typeof type> {
		const token = tokens.shift();
		if (token?.type === type) {
			return token;
		} else {
			const message = parseColorCodes(
				format.replaceAll("<!VAL>", `§l"${token!.value}"§n`)
			);

			throw {
				start: token!.start,
				stop: token!.stop,
				type: ErrorTypes.SyntaxError,
				message,
			} as Error;
		}
	}

	/**
	 * Just parses one value
	 *
	 * @returns The Value
	 */
	function parseValue(): ASTValues {
		const t = tokens.shift()!;

		switch (t.type) {
			case TokenType.Number:
				return {
					type: ASTType.Number,
					value: parseFloat(t.value!),
				} as ASTNumber;

			case TokenType.Literal:
				return { type: ASTType.Literal, value: t.value! } as ASTLiteral;

			case TokenType.Identifier: {
				const node: ASTIdentifer = {
					type: ASTType.Identifier,
					value: t.value!,
				};

				// Check for CallExpression
				if (tokens[0].type === TokenType.OpenParen) {
					tokens.shift();
					const args: ASTValues[] = [];

					// @ts-ignore it gets shifted up there, so it's fine
					while (tokens[0].type !== TokenType.CloseParen) {
						args.push(parseExpression());

						// @ts-ignore it gets shifted up there, so it's fine
						if (tokens[0].type === TokenType.CloseParen) break;
						expect(TokenType.Comma, "Comma Expected 1");
					}

					tokens.shift();
					return {
						type: ASTType.CallExpression,
						arguments: args,
						callee: node,
					} as ASTCallExpression;
				}

				// Check for SelectorExpression
				else if (tokens[0].type === TokenType.Selector) {
					const value = tokens[0].value;
					tokens.shift();
					return {
						value: node,
						type: ASTType.SelectorExpression,
						selector: value,
					} as ASTSelectorExpression;
				}

				// Check for MemberExpression
				else if (tokens[0].type === TokenType.OpenBracket) {
					tokens.shift();
					const value = parseExpression();

					expect(TokenType.CloseBracket);

					return {
						member: value,
						type: ASTType.MemberExpression,
						value: node,
					} as ASTMemberExpression;
				}

				return node;
			}

			// Handle Arrays
			case TokenType.OpenBracket: {
				const elements: ASTNode[] = [];

				while (tokens[0]?.type !== TokenType.CloseBracket) {
					elements.push(parseExpression());

					// @ts-ignore typescript can't read
					if (tokens[0].type === TokenType.CloseBracket) continue;
					expect(TokenType.Comma, "Comma Expected 2");
				}
				tokens.shift();

				return {
					type: ASTType.ArrayExpression,
					elements,
				} as ASTArrayExpression;
			}

			// Handle Dictionaries
			case TokenType.OpenCurly: {
				const properties: ASTObjectExpression["properties"] = [];

				while (tokens[0]?.type !== TokenType.CloseCurly) {
					const key = parseExpression();

					expect(TokenType.Colon, "Colon Expected");

					const value = parseExpression();
					properties.push({ key, value });

					// @ts-ignore no
					if (tokens[0]?.type === TokenType.CloseCurly) continue;
					expect(TokenType.Comma, "Comma Expected 3");
				}

				tokens.shift();

				return {
					type: ASTType.ObjectExpression,
					properties,
				} as ASTObjectExpression;
			}

			default:
				throw {
					start: t.start,
					stop: t.stop,
					type: ErrorTypes.SyntaxError,
					message: adv`Unexpected Token found: §l"${t.value}"§n [DF]`,
				} as Error;
		}
	}

	/**
	 * Wrapper for parsing all types of values
	 * @returns A Value
	 */
	function parsePrimary(): ASTValues {
		const token = tokens[0];

		if (token?.type === TokenType.OpenParen) {
			tokens.shift();
			const expression = parseExpression();
			expect(TokenType.CloseParen);
			return expression;
		}

		return parseValue();
	}

	/**
	 * Parses one binary expression
	 * @param minPrecedence
	 * @returns The expression
	 */
	function parseExpression(minPrecedence = 0): ASTValues {
		let left = parsePrimary();

		while (true) {
			const token = tokens[0];
			if (!token.value || !Object.keys(precedence).includes(token.value)) break;

			// @ts-ignore we check for the value above so shut up
			const precedence_value = precedence[token.value!] as number;
			if (precedence_value === undefined || precedence_value < minPrecedence)
				break;

			const operator = token.value! as ASTOperators;
			tokens.shift();

			const right = parseExpression(precedence_value + 1);
			left = {
				type: ASTType.BinaryExpression,
				left,
				right,
				operator,
			} as ASTBinaryExpression;
		}

		return left;
	}

	function parseDeclarationExpression(
		scope: "global" | "local" | "var"
	): ASTVariableDeclaration {
		const keywordToken = tokens.shift()!;
		const left = parseValue();

		if (left.type !== ASTType.Identifier)
			throw {
				type: ErrorTypes.SyntaxError,
				start: keywordToken.start,
				stop: keywordToken.stop,
				message: "Only identifiers are supported during declaration",
			} as Error;

		const hasInit = tokens[0].type === TokenType.Equals;
		let init;

		if (hasInit && scope !== "local") {
			tokens.shift();
			init = parseExpression();
		} else if (hasInit && scope === "local") {
			throw {
				type: ErrorTypes.SyntaxError,
				start: keywordToken.start,
				stop: keywordToken.stop,
				message: "Local variables do not support init values",
			} as Error;
		} else if (scope !== "local") {
			throw {
				type: ErrorTypes.SyntaxError,
				start: keywordToken.start,
				stop: keywordToken.stop,
				message: capitalize(scope) + " variables must have an init value",
			} as Error;
		}

		return { left, scope, type: ASTType.VariableDeclaration, init };
	}

	function parseStatement() {
		const t = tokens[0];

		if (t.type === TokenType.Global)
			return parseDeclarationExpression("global");
		if (t.type === TokenType.Local) return parseDeclarationExpression("local");
		if (t.type === TokenType.Var) return parseDeclarationExpression("var");

		return parseExpression();
	}

	const program: ASTBlockStatement = { type: ASTType.BlockStatement, body: [] };

	while (tokens[0]?.type !== TokenType.EOF) {
		program.body.push(parseStatement());

		expect(TokenType.Semicolon);
	}

	return program;
}
