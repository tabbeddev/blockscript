import { adv } from "./console.ts";
import { insertStringAt } from "./util.ts";
import { sprintf } from "jsr:@std/fmt/printf";

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

	const lineLengthDistance = (lineNumber + 1).toString().length;

	const pointerLine =
		" ".repeat(lineLengthDistance + 1) +
		"|" +
		" ".repeat(columnStart + lineText.split("\t").length) +
		"^".repeat(Math.max(1, columnEnd - columnStart));

	// Colors
	lineText = insertStringAt(lineText, columnEnd, "§r§8");
	lineText = insertStringAt(lineText, columnStart, "§c§l");
	lineText = lineText.replaceAll("\t", "  ");

	console.log(adv`  File §d"${filename}"§r, line §d${lineNumber}§r:`);

	const prevLine = lines[lineNumber - 2]?.replaceAll("\t", "  ");
	const nextLine = lines[lineNumber]?.replaceAll("\t", "  ");

	const prevLineNumber = sprintf(`%.${lineLengthDistance}d`, lineNumber - 1);
	const fmtLineNumber = sprintf(`%.${lineLengthDistance}d`, lineNumber);
	const nextLineNumber = sprintf(`%.${lineLengthDistance}d`, lineNumber + 1);

	if (lines[lineNumber - 2])
		console.log(adv`    §8§l${prevLineNumber}§n | ${prevLine}§r`);

	console.log(adv`    §c§l${fmtLineNumber} |§8§n ${lineText}§r`);
	console.log(adv`    §c§l${pointerLine}§r`);

	if (lines[lineNumber])
		console.log(adv`    §8§l${nextLineNumber}§n | ${nextLine}§r`);
}
