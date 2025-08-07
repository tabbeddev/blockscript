export function insertStringAt(
	orig: string,
	pos: number,
	insertion: string
): string {
	return [orig.slice(0, pos), insertion, orig.slice(pos)].join("");
}

export const capitalize = (input: string) =>
	input[0].toUpperCase() + input.slice(1);
