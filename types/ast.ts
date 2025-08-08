export enum ASTType {
	BlockStatement,
	FunctionDeclaration,
	VariableDeclaration,

	MemberExpression,
	SelectorExpression,

	AssignmentExpression,
	CallExpression,

	ReturnStatement,

	BinaryExpression,

	Literal,
	Number,
	Identifier,
	Selector,

	ArrayExpression,
	ObjectExpression,

	ForLoop,
	ForInLoop,
	HardcodeLoop,
	IfStatement,
}

export interface ASTNode {
	type: ASTType;
}

export type ASTValues =
	| ASTLiteral
	| ASTNumber
	| ASTIdentifier
	| ASTSelector
	| ASTCallExpression
	| ASTBinaryExpression
	| ASTArrayExpression
	| ASTObjectExpression
	| ASTSelectorExpression
	| ASTMemberExpression;

export type ASTAssignmentValue =
	| ASTMemberExpression
	| ASTSelectorExpression
	| ASTIdentifier;

export interface ASTLiteral extends ASTNode {
	type: ASTType.Literal;
	value: string;
}

export interface ASTNumber extends ASTNode {
	type: ASTType.Number;
	value: number;
}

export interface ASTIdentifier extends ASTNode {
	type: ASTType.Identifier;
	value: string;
}

export interface ASTSelector extends ASTNode {
	type: ASTType.Selector;
	value: string;
}

export type ASTAssignmentOperators = "=" | "+=" | "-=" | "*=" | "/=" | "%=";

export const precedence = {
	"||": 1,
	"&&": 2,

	"==": 3,
	"!=": 3,

	"<": 4,
	"<=": 4,
	">": 4,
	">=": 4,
	in: 4,

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
	left: ASTValues;
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

export interface ASTReturnStatement extends ASTNode {
	type: ASTType.ReturnStatement;
	values: ASTValues[];
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
	selector: ASTSelector;
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

export interface ASTHardcodeLoop extends ASTNode {
	type: ASTType.HardcodeLoop;
	start: ASTNumber;
	stop: ASTNumber;
	variableName: ASTIdentifier;

	body: ASTBlockStatement;
}

export interface ASTForLoop extends ASTNode {
	type: ASTType.ForLoop;
	startExpr: ASTAssignmentExpression;
	runningExpr: ASTNode;
	checkExpr: ASTNode;

	body: ASTBlockStatement;
}

export interface ASTForInLoop extends ASTNode {
	type: ASTType.ForInLoop;
	valueName: ASTIdentifier;
	object: ASTValues;

	body: ASTBlockStatement;
}

export interface ASTIfStatement extends ASTNode {
	type: ASTType.IfStatement;
	condition: ASTValues;

	thenBlock: ASTBlockStatement;
	elseBlock?: ASTBlockStatement;

	elif?: ASTIfStatement;
}
