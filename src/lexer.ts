import {
	characterLookup,
	keywordLookup,
	Token,
	TokenType,
} from "../types/lexer.ts";
import { type Error, ErrorTypes } from "../types/errors.ts";

function isAlpha(src: string) {
	return src.toUpperCase() != src.toLowerCase() || src === "_";
}

function isSkippable(str: string) {
	return str == " " || str == "\n" || str == "\t";
}

function isInt(str: string) {
	const c = str.charCodeAt(0);
	const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
	return c >= bounds[0] && c <= bounds[1];
}

export function* tokenize(contents: string): Generator<Token, void, unknown> {
	const src: string[] = contents.split("");
	const length = src.length;

	while (src.length > 0) {
		let characterIndex = length - src.length;

		// Multi Key Tokens
		if (isInt(src[0])) {
			const start = characterIndex;
			let num = "";

			while (src.length > 0 && (isInt(src[0]) || src[0] === ".")) {
				num += src.shift();
				characterIndex++;
			}

			if (num.endsWith("."))
				throw {
					start: characterIndex - 1,
					stop: characterIndex,
					type: ErrorTypes.SyntaxError,
					message: "Numbers can't end with a dot",
				} as Error;

			yield { type: TokenType.Number, value: num, start, stop: characterIndex };
		} else if (src[0] === '"') {
			src.shift();

			const start = characterIndex + 1;
			let string = "";
			while (src.length > 0 && src[0] !== '"') {
				string += src.shift();
			}

			src.shift();
			yield {
				type: TokenType.Literal,
				value: string,
				start,
				stop: characterIndex,
			};
		} else if (src[0] === "'") {
			src.shift();

			const start = characterIndex + 1;
			let string = "";

			while (src.length > 0 && src[0] !== "'") {
				string += src.shift();
				characterIndex++;
			}

			src.shift();
			yield {
				type: TokenType.Literal,
				value: string,
				start,
				stop: characterIndex,
			};
		} else if (src[0] === "<" && src.length > 1 && src[1] === "@") {
			const start = characterIndex;
			let selector = "";
			src.shift();
			// @ts-ignore Because of the shift
			while (src.length > 0 && src[0] !== ">") {
				selector += src.shift();
			}
			src.shift();

			yield {
				type: TokenType.Selector,
				value: selector,
				start,
				stop: characterIndex,
			};
		} else if (src[0] === "=" && src[1] === "=") {
			src.shift();
			src.shift();
			yield {
				type: TokenType.DoubleEquals,
				value: "==",
				start: characterIndex,
				stop: characterIndex + 1,
			};
		} else if (isAlpha(src[0])) {
			const start = characterIndex;
			let value = "";

			while (src.length > 0 && isAlpha(src[0])) {
				value += src.shift();
				characterIndex++;
			}

			const reserved = keywordLookup[value];
			if (reserved) {
				yield { type: reserved, value, start, stop: characterIndex };
			} else {
				yield {
					type: TokenType.Identifier,
					value,
					start,
					stop: characterIndex,
				};
			}

			// Single Key Tokens
		} else if (src[0] in characterLookup) {
			yield {
				type: characterLookup[src[0]],
				value: src.shift(),
				start: characterIndex,
				stop: characterIndex + 1,
			};
		} else if (isSkippable(src[0])) {
			src.shift();
		} else if (src[0] === "#") {
			// Comment
			src.shift();
			while (src[0] !== "#") {
				src.shift();
			}
			src.shift();
		} else {
			console.log(src[0], characterIndex);
			throw {
				start: characterIndex,
				stop: characterIndex + 1,
				type: ErrorTypes.SyntaxError,
				message: "Unparsable character",
			} as Error;
		}
	}
	yield {
		type: TokenType.EOF,
		start: length,
		stop: length,
	};
}
