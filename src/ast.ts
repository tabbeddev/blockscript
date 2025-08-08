import { keywordLookup, type Token, TokenType } from "../types/lexer.ts";
import {
	type ASTBlockStatement,
	type ASTValues,
	ASTType,
	ASTNumber,
	ASTLiteral,
	ASTIdentifier,
	ASTCallExpression,
	ASTArrayExpression,
	ASTObjectExpression,
	ASTSelectorExpression,
	ASTMemberExpression,
	precedence,
	ASTOperators,
	ASTBinaryExpression,
	ASTVariableDeclaration,
	ASTForInLoop,
	ASTForLoop,
	ASTHardcodeLoop,
	ASTAssignmentExpression,
	ASTAssignmentOperators,
	ASTFunctionDeclaration,
	ASTReturnStatement,
	ASTIfStatement,
	ASTSelector,
} from "../types/ast.ts";
import { type Error, ErrorTypes } from "../types/errors.ts";
import { adv, parseColorCodes } from "./console.ts";
import { capitalize } from "./util.ts";

export function produceAST(tokens: Token[]): ASTBlockStatement {
	function parseIdentifierValue(): ASTIdentifier {
		const t = expect({ type: TokenType.Identifier });
		return {
			type: ASTType.Identifier,
			value: t.value!,
		};
	}

	function parseNumberValue(): ASTNumber {
		const t = expect({ type: TokenType.Number });
		return {
			type: ASTType.Number,
			value: parseFloat(t.value!),
		};
	}

	function parseLiteralValue(): ASTLiteral {
		const t = expect({ type: TokenType.Literal });
		return {
			type: ASTType.Literal,
			value: t.value!,
		};
	}

	function parseArrayValue(): ASTArrayExpression {
		expect({ type: TokenType.OpenBracket });
		const elements: ASTValues[] = [];

		while (tokens[0]?.type !== TokenType.CloseBracket) {
			elements.push(parseExpression());

			// @ts-ignore typescript can't read
			if (tokens[0].type === TokenType.CloseBracket) continue;
			expect({ type: TokenType.Comma, format: "Comma Expected" });
		}
		expect({ type: TokenType.CloseBracket });

		return {
			type: ASTType.ArrayExpression,
			elements,
		};
	}

	function parseObjectValue(): ASTObjectExpression {
		expect({ type: TokenType.OpenCurly });
		const properties: ASTObjectExpression["properties"] = [];

		while (tokens[0]?.type !== TokenType.CloseCurly) {
			const key = parseExpression();

			expect({ type: TokenType.Colon, format: "Colon Expected" });

			const value = parseExpression();
			properties.push({ key, value });

			// @ts-ignore no
			if (tokens[0]?.type === TokenType.CloseCurly) continue;
			expect({ type: TokenType.Comma, format: "Comma Expected" });
		}

		expect({ type: TokenType.CloseCurly });

		return {
			type: ASTType.ObjectExpression,
			properties,
		};
	}

	function parseCallExpression(): ASTCallExpression {
		const identifier = parseIdentifierValue();
		expect({ type: TokenType.OpenParen });

		const args: ASTValues[] = [];
		while (tokens[0].type !== TokenType.CloseParen) {
			args.push(parseExpression());

			// @ts-ignore it gets shifted up there, so it's fine
			if (tokens[0].type === TokenType.CloseParen) break;
			expect({ type: TokenType.Comma, format: "Comma Expected" });
		}

		expect({ type: TokenType.CloseParen });

		return {
			type: ASTType.CallExpression,
			arguments: args,
			callee: identifier,
		};
	}

	function parseSelector(): ASTSelector {
		const value = expect({ type: TokenType.Selector }).value!;
		return { type: ASTType.Selector, value };
	}

	function parseSelectorExpression(): ASTSelectorExpression {
		const identifier = parseIdentifierValue();
		const selector = parseSelector();

		return {
			value: identifier,
			selector,
			type: ASTType.SelectorExpression,
		};
	}

	function parseMemberExpression(): ASTMemberExpression {
		const identifier = parseIdentifierValue();

		expect({ type: TokenType.OpenBracket });
		const value = parseExpression();
		expect({ type: TokenType.CloseBracket });

		return {
			member: identifier,
			type: ASTType.MemberExpression,
			value,
		};
	}

	/**
	 * Checks the next Token for the specified token type.
	 *
	 * @returns The Token
	 * @throws When the Token doesn't match
	 */
	function expect({
		type,
		format = "Unexpected Token found: <!VAL> [GN]",
	}: {
		type: TokenType | TokenType[];
		format?: string;
	}): Token {
		const token = tokens.shift();
		type = Array.isArray(type) ? type : [type];

		if (token && type.includes(token.type)) {
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
		const t = tokens[0];

		switch (t.type) {
			case TokenType.Number:
				return parseNumberValue();

			case TokenType.Literal:
				return parseLiteralValue();

			case TokenType.Selector:
				return parseSelector();

			case TokenType.Identifier: {
				const nextToken = tokens[1];

				// Check for CallExpression
				if (nextToken.type === TokenType.OpenParen) {
					return parseCallExpression();
				}

				// Check for SelectorExpression
				else if (nextToken.type === TokenType.Selector) {
					return parseSelectorExpression();
				}

				// Check for MemberExpression
				else if (nextToken.type === TokenType.OpenBracket) {
					return parseMemberExpression();
				}

				return parseIdentifierValue();
			}

			case TokenType.OpenBracket:
				return parseArrayValue();

			case TokenType.OpenCurly:
				return parseObjectValue();

			default:
				if (t.value! in keywordLookup)
					throw {
						type: ErrorTypes.WIPError,
						start: t.start,
						stop: t.stop,
						message: adv`The syntax could be correct, but the keyword §l"${t.value}"§n is currently not supported`,
					} as Error;

				throw {
					start: t.start + 1,
					stop: t.stop + 1,
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
			expect({ type: TokenType.CloseParen });
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
		const left = parseIdentifierValue();

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

		// @ts-ignore we already check above
		return { left, scope, type: ASTType.VariableDeclaration, init };
	}

	function parseAssignmentExpression(): ASTAssignmentExpression {
		const left = parseValue();
		const isBinaryOperation = tokens[1].type === TokenType.Equals;

		let operator: ASTAssignmentOperators;

		if (isBinaryOperation) {
			const operation = expect({
				type: [TokenType.BinaryOperator, TokenType.Slash],
			}).value!;
			operator = (operation + "=") as ASTAssignmentOperators;
			expect({ type: TokenType.Equals });
		} else {
			expect({ type: TokenType.Equals });
			operator = "=";
		}

		const right = parseExpression();
		return {
			left,
			right,
			operator,
			type: ASTType.AssignmentExpression,
		};
	}

	function parseForLoop(): ASTForInLoop | ASTForLoop {
		tokens.shift();
		const isInLoop = tokens[1].type === TokenType.In;

		if (isInLoop) {
			const valueName = parseIdentifierValue();
			expect({ type: TokenType.In });
			const object = parseExpression();

			const body = parseBlockStatement();

			return { type: ASTType.ForInLoop, body, valueName, object };
		} else {
			const startExpr = parseAssignmentExpression();
			expect({ type: TokenType.With });
			const runningExpr = parseStatement();
			expect({ type: TokenType.While });
			const checkExpr = parseExpression();

			const body = parseBlockStatement();

			return { type: ASTType.ForLoop, startExpr, runningExpr, body, checkExpr };
		}
	}

	function parseHardcodeLoop(): ASTHardcodeLoop {
		tokens.shift();
		const start = parseNumberValue();
		expect({ type: TokenType.To });
		const stop = parseNumberValue();
		expect({ type: TokenType.As });
		const as = parseIdentifierValue();

		const body = parseBlockStatement();

		return {
			start,
			stop,
			variableName: as,
			type: ASTType.HardcodeLoop,
			body,
		} as ASTHardcodeLoop;
	}

	function parseBlockStatement(): ASTBlockStatement {
		expect({ type: TokenType.OpenCurly });
		const program: ASTBlockStatement = {
			type: ASTType.BlockStatement,
			body: [],
		};

		while (![TokenType.EOF, TokenType.CloseCurly].includes(tokens[0]?.type)) {
			program.body.push(parseStatement());

			expect({ type: TokenType.Semicolon, format: "Semicolon Expected" });
		}

		expect({ type: TokenType.CloseCurly });

		return program;
	}

	function parseFunction(): ASTFunctionDeclaration {
		tokens.shift();
		const left = parseIdentifierValue();

		expect({ type: TokenType.OpenParen });
		const params: string[] = [];

		while (tokens[0].type !== TokenType.CloseParen) {
			params.push(parseIdentifierValue().value);
			// @ts-ignore no
			if (tokens[0].type === TokenType.CloseParen) break;
			expect({ type: TokenType.Comma, format: "Comma Expected" });
		}
		expect({ type: TokenType.CloseParen });

		const body = parseBlockStatement();

		return { left, params, body, type: ASTType.FunctionDeclaration };
	}

	function parseReturnStatement(): ASTReturnStatement {
		tokens.shift();

		const values: ASTValues[] = [];

		while (tokens[0].type !== TokenType.Semicolon) {
			values.push(parseExpression());

			if (tokens[0].type !== TokenType.Comma) break;
			expect({ type: TokenType.Comma, format: "Comma Expected" });
		}

		return { type: ASTType.ReturnStatement, values };
	}

	function parseIfStatement(): ASTIfStatement {
		tokens.shift(); // consume keyword
		const condition = parseExpression();

		const thenBlock = parseBlockStatement();

		let elif: ASTIfStatement | undefined = undefined;
		let elseBlock: ASTBlockStatement | undefined = undefined;

		const nextToken = tokens[0];
		if (nextToken.type === TokenType.Elif) {
			elif = parseIfStatement();
		} else if (nextToken.type === TokenType.Else) {
			expect({ type: TokenType.Else });
			elseBlock = parseBlockStatement();
		}

		return { condition, thenBlock, type: ASTType.IfStatement, elif, elseBlock };
	}

	function parseStatement() {
		const t = tokens[0];

		if (t.type === TokenType.Function) return parseFunction();
		if (t.type === TokenType.Return) return parseReturnStatement();
		if (t.type === TokenType.If) return parseIfStatement();

		// Variable Declarations
		if (t.type === TokenType.Global)
			return parseDeclarationExpression("global");
		if (t.type === TokenType.Local) return parseDeclarationExpression("local");
		if (t.type === TokenType.Var) return parseDeclarationExpression("var");

		// Loops
		if (t.type === TokenType.For) return parseForLoop();
		if (t.type === TokenType.Hardcode) return parseHardcodeLoop();

		const lineHasEquals = Boolean(
			tokens
				.toSpliced(tokens.findIndex((v) => v.type === TokenType.Semicolon))
				.find((v) => v.type === TokenType.Equals)
		);

		if (lineHasEquals) return parseAssignmentExpression();

		return parseExpression();
	}

	const program: ASTBlockStatement = { type: ASTType.BlockStatement, body: [] };

	while (tokens[0]?.type !== TokenType.EOF) {
		program.body.push(parseStatement());

		expect({ type: TokenType.Semicolon, format: "Semicolon Expected" });
	}

	return program;
}
