export enum ErrorTypes {
	SyntaxError,
	WIPError
}

export interface Error {
	type: ErrorTypes;
	message: string;
	start: number;
	stop: number;
}