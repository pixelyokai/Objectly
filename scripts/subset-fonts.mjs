import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import subsetFont from "subset-font";

// Only 400 and 500 are referenced (body default plus `font-medium`); Semibold and
// Bold shipped ~318KB for nothing. Sources stay in Assets/OpenRunde if they're
// ever needed again.
const WEIGHTS = [
  { file: "OpenRunde-Regular", weight: 400 },
  { file: "OpenRunde-Medium", weight: 500 },
];

// Latin-1 + Latin Extended-A + the punctuation the UI and descriptions use.
const CHARS = [
  ...range(0x20, 0x7e),
  ...range(0xa0, 0xff),
  ...range(0x100, 0x17f),
  ..."‘’“”–—•…€™ ",
].join("");

const SOURCE_DIR = "Assets/OpenRunde";
const OUT_DIR = "public/assets/OpenRunde";

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

let before = 0;
let after = 0;

for (const { file, weight } of WEIGHTS) {
  const source = readFileSync(`${SOURCE_DIR}/${file}.woff2`);
  const subset = await subsetFont(source, CHARS, { targetFormat: "woff2" });
  writeFileSync(`${OUT_DIR}/${file}.woff2`, subset);
  before += source.length;
  after += subset.length;
  console.log(`${file} (${weight}): ${kb(source.length)} -> ${kb(subset.length)}`);
}

console.log(`total shipped: ${kb(before)} -> ${kb(after)}`);

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i));
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)}kB`;
}
