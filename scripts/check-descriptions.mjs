import { readFileSync } from "node:fs";
import { readIcons } from "./icons-lib.mjs";

const source = readFileSync("src/data/descriptions.ts", "utf8");
const described = new Set([...source.matchAll(/^\s*"([^"]+)":/gm)].map((match) => match[1]));
const missing = readIcons().filter(({ id }) => !described.has(id));

if (missing.length === 0) {
  console.log(`All ${described.size} icons have descriptions.`);
} else {
  console.error(`Missing ${missing.length} description(s):`);
  for (const { id, name, category } of missing) console.error(`  ${id}  (${name} — ${category})`);
  process.exitCode = 1;
}
