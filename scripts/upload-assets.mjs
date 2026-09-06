import { spawn } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

// Uploads dist-assets/ to R2 through wrangler, which authenticates with your
// existing `wrangler login` session — so there are still no access keys stored
// anywhere in this project.
//
// wrangler has no recursive R2 upload, and 480 sequential invocations take
// 10-20 minutes because each one spawns a fresh process. These run in parallel
// batches instead. Re-running is safe: uploads overwrite by key, so a failed
// run can simply be repeated.
const BUCKET = "objectly-icons";
const OUT_DIR = "dist-assets";
const CONCURRENCY = 12;

const only = process.argv[2]; // optional: "preview" or "full"

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(OUT_DIR)
  .filter((path) => path.endsWith(".png"))
  // POSIX separators: the R2 key must match what the Worker builds, and Windows
  // would otherwise produce preview\ai\ai-chip.png.
  .map((path) => ({ path, key: relative(OUT_DIR, path).split(sep).join("/") }))
  .filter(({ key }) => !only || key.startsWith(`${only}/`));

if (files.length === 0) {
  console.error(`No .png files under ${OUT_DIR}/${only ?? ""} — run \`npm run prepare:assets\` first.`);
  process.exit(1);
}

const upload = ({ path, key }) =>
  new Promise((resolve) => {
    const child = spawn(
      "npx",
      ["wrangler", "r2", "object", "put", `${BUCKET}/${key}`, "--file", path, "--remote", "--content-type", "image/png"],
      { shell: true, stdio: ["ignore", "ignore", "pipe"] }
    );

    let stderr = "";
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => resolve({ key, ok: code === 0, stderr }));
  });

let done = 0;
const failures = [];

console.log(`Uploading ${files.length} files to ${BUCKET} (${CONCURRENCY} at a time)...`);

for (let i = 0; i < files.length; i += CONCURRENCY) {
  const results = await Promise.all(files.slice(i, i + CONCURRENCY).map(upload));
  for (const result of results) {
    done += 1;
    if (!result.ok) failures.push(result);
  }
  process.stdout.write(`\r  ${done}/${files.length}${failures.length ? `  (${failures.length} failed)` : ""}`);
}

console.log("");

if (failures.length > 0) {
  console.error(`\n${failures.length} upload(s) failed:`);
  for (const { key, stderr } of failures.slice(0, 5)) {
    console.error(`  ${key}: ${stderr.trim().split("\n").pop()}`);
  }
  console.error("\nRe-run to retry — uploads overwrite by key, so completed files cost nothing.");
  process.exit(1);
}

console.log(`Done. ${files.length} objects uploaded.`);
