import { parseArgs } from "@std/cli/parse-args";
import { parse } from "./src/parser.ts";
import { ErrorTypes, type Error as BSError } from "./types/errors.ts";
import { adv } from "./src/console.ts";
import { printErrorContext } from "./src/printError.ts";

const flags = parseArgs(Deno.args, {
	boolean: ["debug", "help"],
	string: ["file"],
});

if (flags.help || !flags.file) {
	console.log("Specify file path with --file");
	Deno.exit(1);
}

const content = Deno.readTextFileSync(flags.file);

try {
	const result = parse(content);

	if (flags.debug) {
		console.log(
			adv`§8[§r§lDebug§n§8]§r Writing compiler output to result.json`
		);
		Deno.writeTextFileSync("result.json", JSON.stringify(result));
	}

	console.log(result);

	// deno-lint-ignore no-explicit-any
} catch (e: any) {
	if (e.start !== undefined && e.stop !== undefined && e.message) {
		// Handle compiler errors

		const error = e as BSError;

		console.log(adv`§u§lException occured while compiling:§r`);

		printErrorContext(content, flags.file, error.start, error.stop);

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
