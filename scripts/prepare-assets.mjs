import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { PREVIEW_SIZE, SOURCE_DIR, readIcons } from "./icons-lib.mjs";

const OUT_DIR = "dist-assets";

const icons = readIcons();

for (const { id, category, file } of icons) {
  const source = join(SOURCE_DIR, category, file);
  // Slugged key, matching worker/icons.generated.ts — no spaces in R2.
  const preview = join(OUT_DIR, "preview", `${id}.png`);
  const full = join(OUT_DIR, "full", `${id}.png`);

  mkdirSync(dirname(preview), { recursive: true });
  mkdirSync(dirname(full), { recursive: true });

  if (!existsSync(full)) copyFileSync(source, full);
  if (!existsSync(preview)) {
    await sharp(source).resize(PREVIEW_SIZE, PREVIEW_SIZE, { fit: "inside" }).png().toFile(preview);
  }
}

console.log(`${icons.length} icons written to ${OUT_DIR}/preview and ${OUT_DIR}/full — source tree untouched.`);
console.log(`Upload both prefixes to the objectly-icons bucket, preserving paths.`);
