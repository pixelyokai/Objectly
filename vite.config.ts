import { createReadStream, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import sharp from "sharp";
import { PREVIEW_SIZE, SOURCE_DIR, readIcons } from "./scripts/icons-lib.mjs";

const CACHE_DIR = "node_modules/.cache/objectly-preview";

// Sources are 2048px / ~1.6MB each. Production serves the 256px preview tier from
// the CDN, so dev generates and caches the same thing — otherwise the browser
// decodes 240 full-resolution PNGs and the grid drag stutters.
function servePreviews(): Plugin {
  const prefix = "/assets/images/";
  return {
    name: "objectly-preview-images",
    apply: "serve",
    configureServer(server) {
      // Read inside configureServer, not at config-eval time: `vite build`
      // also evaluates this file, and CI has no Assets/Images/ to scan.
      // Requests use the slugged R2 key; map it back to the real source filename.
      const sources = new Map(readIcons().map((icon) => [`${icon.id}.png`, join(SOURCE_DIR, icon.category, icon.file)]));
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.toLowerCase().startsWith(prefix)) return next();

        // 404 rather than next(): Windows is case-insensitive, so falling through
        // would let Vite serve the 2048px source tree straight off disk.
        const key = url.slice(prefix.length);
        const source = sources.get(key);
        if (!source) {
          res.statusCode = 404;
          return res.end("Not found");
        }

        const cached = join(CACHE_DIR, key);
        if (!existsSync(cached)) {
          mkdirSync(dirname(cached), { recursive: true });
          await sharp(source).resize(PREVIEW_SIZE, PREVIEW_SIZE, { fit: "inside" }).png().toFile(cached);
        }

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        createReadStream(cached).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), servePreviews()],
  // Windows filesystems are case-insensitive, so without this Vite happily serves
  // /assets/Images/... straight out of the 2048px source tree, bypassing the
  // preview middleware entirely.
  server: { fs: { deny: ["**/Assets/**", "**/dist-assets/**"] } },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Hashed output lives under /build/ so it can be cached immutably without the
  // rule also catching the unhashed brand files under /assets/.
  build: { assetsDir: "build" },
});
