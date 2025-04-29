// Represents tokens that blockscript understands in parsing.
export enum TokenType {
  // Literal Types
  Number,
  Identifier,
  Literal,
  Selector,

  // Keywords
  Let,
  Slash,
  Export,
  Function,
  Global,
  Local,
  Hardcode,
  For,
  With,
  While,
  In,
  To,
  As,
  Return,

  // Grouping * Operators
  BinaryOperator,
  Equals,

  OpenParen,
  CloseParen,

  OpenCurly,
  CloseCurly,

  OpenBracket,
  CloseBracket,

  MoreThan, // also used for entity / local variables
  LessThan,

  Semicolon,
  Colon,
  Underscore,
  Quote,
  DoubleQuote,
  Comma,
  Hashtag, // for comments

  EOF,
}

export interface Token {
  value?: string;
  type: TokenType;
	start: number;
	stop: number;
}

type KeywordLookup = Record<string, TokenType>;

export const keywordLookup: KeywordLookup = {
  let: TokenType.Let,
  slash: TokenType.Slash,
  function: TokenType.Function,
  global: TokenType.Global,
  local: TokenType.Local,
  hardcode: TokenType.Hardcode,
  for: TokenType.For,
  with: TokenType.With,
  while: TokenType.While,
  in: TokenType.In,
  to: TokenType.To,
  as: TokenType.As,
  export: TokenType.Export,
  return: TokenType.Return,
};

export const characterLookup: KeywordLookup = {
  "=": TokenType.Equals,
  "(": TokenType.OpenParen,
  ")": TokenType.CloseParen,
  "[": TokenType.OpenBracket,
  "]": TokenType.CloseBracket,
  "{": TokenType.OpenCurly,
  "}": TokenType.CloseCurly,
  "<": TokenType.LessThan,
  ">": TokenType.MoreThan,
  ";": TokenType.Semicolon,
  ":": TokenType.Colon,
  '"': TokenType.DoubleQuote,
  "'": TokenType.Quote,
  ",": TokenType.Comma,
  "/": TokenType.Slash,
  _: TokenType.Underscore,

  "+": TokenType.BinaryOperator,
  "-": TokenType.BinaryOperator,
  "*": TokenType.BinaryOperator,
  // Divide is it's own TokenType
  "%": TokenType.BinaryOperator,

  "#": TokenType.Hashtag,
};
