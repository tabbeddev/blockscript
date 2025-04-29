import { parseArgs } from "@std/cli/parse-args";
import { parse } from "./src/parser.ts";
import { ErrorTypes, type Error as BSError } from "./types/errors.ts";
import {
	countAtStart,
	getLineBreakIndexes,
	getLineNumberByIndexes,
	insertStringAt,
} from "./src/util.ts";
import { adv, parseColorCodes } from "./src/console.ts";

const flags = parseArgs(Deno.args, {
	boolean: ["debug", "help"],
	string: ["file"],
});

if (flags.help || !flags.file) {
	console.log("Specify file path with --file");
	Deno.exit(1);
}

const content = Deno.readTextFileSync(flags.file);
const lines = content.replaceAll("\t", " ").split("\n");
const breaks = getLineBreakIndexes(content);

try {
	const result = parse(content);

	// deno-lint-ignore no-explicit-any
} catch (e: any) {
	if (e.start && e.stop && e.message) {
		// Handle compiler errors

		const error = e as BSError;
		const line = getLineNumberByIndexes(error.start, breaks.slice());

		const start_in_line = breaks[line - 1] || 0;
		const length = error.stop - error.start;
		const offset_left = error.start - start_in_line - 1;

		let line_string = lines[line];

		if (length > 0) {
			line_string = insertStringAt(line_string, offset_left + length, "§r");
			line_string = insertStringAt(line_string, offset_left, "§c§l");
		}

		if (lines[line].startsWith(" ")) {
			// Replace heading spaces with another character that symbolizes a space
			const count = countAtStart(line_string, " ");

			line_string = insertStringAt(line_string, count, "§r");
			line_string = ">".repeat(count) + line_string.substring(count);
			line_string = "§b" + line_string;
		}

		console.log(adv`§u§lException occured while compiling:§r`);
		console.log(adv`  File §d"${flags.file}"§r, line §d${line + 1}§r`);
		console.log("    " + parseColorCodes(line_string));
		if (length > 0)
			console.log(adv`    §c§l` + " ".repeat(offset_left) + "^".repeat(length));
		console.log(adv`§l§5${ErrorTypes[error.type]}: §r§d${error.message}`);
	} else {
		// Handle all other erros

		const error = e as Error;
		console.log(adv`§e§u§l:( The BlockScript compiler has crashed:§r`);
		console.log("Please note, that this is not a problem with your code!\n");
		console.log(adv`§l§uFurther information:§r\n`);
		console.log(adv`§lType: §r${error.name}`);
		console.log(adv`§lMessage: §r${error.message}`);
		console.log(adv`§lStack: §r${error.stack}`);
	}

	Deno.exit(1);
}
