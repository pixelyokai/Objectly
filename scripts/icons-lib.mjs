import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const SOURCE_DIR = "Assets/Images";
export const PREVIEW_SIZE = 256;

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function readIcons() {
  return readdirSync(SOURCE_DIR)
    .filter((entry) => statSync(join(SOURCE_DIR, entry)).isDirectory())
    .sort()
    .flatMap((category) =>
      readdirSync(join(SOURCE_DIR, category))
        .filter((file) => file.toLowerCase().endsWith(".png"))
        .sort()
        .map((file) => {
          const name = file.replace(/\.png$/i, "");
          return { id: `${slugify(category)}/${slugify(name)}`, name, category, file };
        })
    );
}
