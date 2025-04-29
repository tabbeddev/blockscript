export enum ASTType {
  BlockStatement,
  ExportedNamedDeclaration,
  FunctionDeclaration,
  VariableDeclaration,

  AssignmentExpression,
  CallExpression,
}

export enum ASTGeneratorLayers {
  FunctionArguments,
  BlockFunction,
  IfBlockFunction,

  CallArguments,
  Indexer,

  String,
  Array,
  Dictionary,

  Comment,
}

export enum ASTGeneratorExpectStates {
  Normal, // Identifier or keyword
  Export, // export ...
  FunctionArgumentsOpen, // [name]...
  // NOTE: Arguments is a layer not a state

  OpenBlock, // function random() ...
  Identifier, // function ... or global ...

  Semicolon,
  Equals, // global name = ...

  Values, // string, array, dict or number
  AnythingWithIdentifier, // Operator or OpenParen
}

interface ASTElement {
  type: ASTType;
}

type ASTValues = string | number | ASTValues[] | { [key: string]: ASTValues } | ASTCallExpression;
type ASTAssignmentOperatoes = "=" | "+=" | "-=" | "*=" | "/=" | "%=";

export interface ASTBlockStatement extends ASTElement {
  type: ASTType.BlockStatement;
  body: ASTElement[];
}

export interface ASTExportedNamedDeclaration extends ASTElement {
  type: ASTType.ExportedNamedDeclaration;
  declaration: ASTDeclarationElement;
}

export interface ASTDeclarationElement extends ASTElement {
  name: string;
}

export interface ASTFunctionDeclaration extends ASTDeclarationElement {
  type: ASTType.FunctionDeclaration;
  body: ASTBlockStatement;
  params: string[];
}

export interface ASTVariableDeclaration extends ASTDeclarationElement {
  type: ASTType.VariableDeclaration;
  init: ASTValues;
}

export interface ASTAssignmentExpression extends ASTDeclarationElement {
  type: ASTType.AssignmentExpression;
  operator: ASTAssignmentOperatoes;
  right: ASTValues;
}

export interface ASTCallExpression extends ASTElement {
	type: ASTType.CallExpression;
	identifier: string;
	arguments: ASTValues[];
}