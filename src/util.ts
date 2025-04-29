function* getIndexesOfString(
  str: string,
  character: string
): Generator<number, void, unknown> {
	let line = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === character) {
			line++;
			yield i + 1;
		}
  }
}

export function getLineBreakIndexes(str: string): number[] {
  return getIndexesOfString(str, "\n").toArray();
}

export function getLineNumberByIndexes(pos: number, breaks: number[]): number {
  let line = 0;
  while (breaks[0] <= pos) {
    breaks.shift();
    line += 1;
  }
  return line;
}

export function insertStringAt(
  orig: string,
  pos: number,
  insertion: string
): string {
  return [orig.slice(0, pos), insertion, orig.slice(pos)].join("");
}

export function countAtStart(str: string, char: string) {
	const broken_string = str.split("");

	let i = 0;
	while (broken_string[0] === char) {
		i++;
		broken_string.shift();
	}
	return i;
}