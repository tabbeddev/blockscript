import { keywordLookup, type Token, TokenType } from "../types/lexer.ts";
import {
  type ASTBlockStatement,
  type ASTCallExpression,
  ASTType,
  ASTGeneratorExpectStates,
} from "../types/ast.ts";
import { type Error, ErrorTypes } from "../types/errors.ts";

import { adv } from "./console.ts";

export function produceAST(tokens: Token[]): ASTBlockStatement {
  function produce(body: ASTBlockStatement["body"], isGlobal: boolean) {
    let state: ASTGeneratorExpectStates = ASTGeneratorExpectStates.Normal;
    let done = false;

    while (!done) {
      const token = tokens.shift() as Token;

      switch (state) {
        case ASTGeneratorExpectStates.Normal:
          switch (token.type) {
            case TokenType.Identifier:
              // TODO: Implement
              body.push({
                type: ASTType.CallExpression,
                arguments: [],
                identifier: token.value,
              } as ASTCallExpression);
              state = ASTGeneratorExpectStates.Semicolon;
              break;

            default: {
              // @ts-ignore The rest will get added later on
              const error: Error = { start: token.start, stop: token.stop };

              if (token.type in Object.values(keywordLookup)) {
                error.type = ErrorTypes.WIPError;
                error.message = adv`The syntax is correct, but the keyword §l"${token.value}"§n used here is not yet supported. Please use another method or wait until this keyword is supported.`;
              } else {
                error.type = ErrorTypes.SyntaxError;
                error.message = adv`Unexpected token found: §l"${token.value}"`;
              }
              throw error;
            }
          }
          break;

        case ASTGeneratorExpectStates.Semicolon:
          if (token.type === TokenType.Semicolon) {
            done = true;
          } else {
            throw {
              message: adv`§l";"§n expected`,
              type: ErrorTypes.SyntaxError,
              start: token.start,
              stop: token.stop,
            } as Error;
          }
          break;
      }
    }
  }

  const program: ASTBlockStatement = { type: ASTType.BlockStatement, body: [] };

  while (tokens[0]?.type !== TokenType.EOF) {
    produce(program.body, true);
  }

  return program;
}
