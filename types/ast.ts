export enum ASTType {
	BlockStatement,
	FunctionDeclaration,
	VariableDeclaration,

	MemberExpression,
	SelectorExpression,

	AssignmentExpression,
	CallExpression,

	BinaryExpression,

	Literal,
	Number,
	Identifier,

	ArrayExpression,
	ObjectExpression,
}

export interface ASTNode {
	type: ASTType;
}

export type ASTValues =
	| ASTLiteral
	| ASTNumber
	| ASTIdentifer
	| ASTCallExpression
	| ASTBinaryExpression
	| ASTArrayExpression
	| ASTObjectExpression
	| ASTSelectorExpression
	| ASTMemberExpression;

export type ASTAssignmentValue =
	| ASTMemberExpression
	| ASTSelectorExpression
	| ASTIdentifer;

export interface ASTLiteral extends ASTNode {
	type: ASTType.Literal;
	value: string;
}

export interface ASTNumber extends ASTNode {
	type: ASTType.Number;
	value: number;
}

export interface ASTIdentifer extends ASTNode {
	type: ASTType.Identifier;
	value: string;
}

type ASTAssignmentOperators = "=" | "+=" | "-=" | "*=" | "/=" | "%=";

export const precedence = {
	"||": 1,
	"&&": 2,

	"==": 3,
	"!=": 3,

	"<": 4,
	"<=": 4,
	">": 4,
	">=": 4,

	"+": 5,
	"-": 5,

	"*": 6,
	"/": 6,
	"%": 6,
};
export type ASTOperators = keyof typeof precedence;

export interface ASTBlockStatement extends ASTNode {
	type: ASTType.BlockStatement;
	body: ASTNode[];
}

// Boilerplate interface
export interface ASTDeclarationElement extends ASTNode {
	left: ASTAssignmentValue;
}

export interface ASTFunctionDeclaration extends ASTDeclarationElement {
	type: ASTType.FunctionDeclaration;
	body: ASTBlockStatement;
	params: string[];
}

export interface ASTVariableDeclaration extends ASTDeclarationElement {
	type: ASTType.VariableDeclaration;
	init?: ASTValues;
	scope: "local" | "global" | "var";
}

export interface ASTAssignmentExpression extends ASTDeclarationElement {
	type: ASTType.AssignmentExpression;
	operator: ASTAssignmentOperators;
	right: ASTValues;
}

export interface ASTCallExpression extends ASTNode {
	type: ASTType.CallExpression;
	callee: ASTValues;
	arguments: ASTValues[];
}

export interface ASTBinaryExpression extends ASTNode {
	type: ASTType.BinaryExpression;
	left: ASTValues;
	right: ASTValues;
	operator: ASTOperators;
}

export interface ASTMemberExpression extends ASTNode {
	// foo[123]
	type: ASTType.MemberExpression;
	value: ASTValues;
	member: ASTValues;
}

export interface ASTSelectorExpression extends ASTNode {
	// foo<@s>
	type: ASTType.SelectorExpression;
	value: ASTAssignmentValue;
	selector: string;
}

export interface ASTArrayExpression extends ASTNode {
	// [1, 2, 3]
	type: ASTType.ArrayExpression;
	elements: ASTValues[];
}

export interface ASTObjectExpression extends ASTNode {
	// {1: 2, 3: 4}
	type: ASTType.ObjectExpression;
	properties: { key: ASTNode; value: ASTNode }[];
}
