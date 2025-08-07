import { adv } from "./console.ts";
import { insertStringAt } from "./util.ts";

export function printErrorContext(
	source: string,
	filename: string,
	start: number,
	end: number
) {
	// Split to lines
	const lines = source.split(/\r?\n/);
	let currentPos = 0;
	let lineNumber = 0;
	let columnStart = 0;
	let columnEnd = 0;
	let lineText = "";

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const nextPos = currentPos + line.length + 1; // +1 for \n

		if (start >= currentPos && start < nextPos) {
			lineNumber = i + 1;
			lineText = line;
			columnStart = start - currentPos;
			columnEnd = Math.min(end - currentPos, line.length);
			break;
		}

		currentPos = nextPos;
	}

	const pointerLine =
		" ".repeat(columnStart) + "^".repeat(Math.max(1, columnEnd - columnStart));

	// Colors
	lineText = insertStringAt(lineText, columnEnd, "§r");
	lineText = insertStringAt(lineText, columnStart, "§c§l");

	console.log(adv`  File §d"${filename}"§r, line §d${lineNumber}§r`);
	console.log(adv`    ${lineText}`);
	console.log(adv`    §c§l${pointerLine}§r`);
}
