<p align="center">
  <img src="public/assets/Brand/og-image.png" alt="Objectly — high-quality free 3D icon packs" width="100%" />
</p>

<h1 align="center">Objectly</h1>

<p align="center">
  A free, premium 3D icon library — 240 icons across 10 packs, on an infinite browsable grid.<br />
  <strong>Free for commercial use. Attribution appreciated, not required.</strong>
</p>

<p align="center">
  <a href="https://objectly.co">objectly.co</a> ·
  <a href="https://x.com/pixelyokai">@pixelyokai</a>
</p>

---

## What it is

Objectly is a browsable grid of 3D-rendered icons, organised into category packs. The grid
tiles infinitely in every direction, search and category filters narrow it live, and any icon
can be downloaded at full resolution from a drawer.

**Packs:** AI · Ecommerce · Finance · Fitness & Sports · Gaming & Devices · Healthcare ·
Home & Living · Marketing & Growth · Security & Privacy · Travel & Hospitality

## Highlights

- **Infinite grid** — a finite icon set tiled by modulo lookup, so filtering just swaps the
  array and the same mechanism keeps working. 60fps under a fast drag.
- **Two-tier assets** — a 256px preview tier served publicly from the CDN, and a
  full-resolution tier that is never publicly addressable and only ever read server-side.
- **Zero-config content** — drop a PNG into a pack folder, restart, and it appears. Packs,
  the categories dropdown, and the download route all derive from a generated manifest.
- **One motion language** — every animation pulls its spring from `src/lib/motion.ts`, and
  every animated component honours `prefers-reduced-motion`.
- **No secrets anywhere** — the download function reaches R2 through a Cloudflare binding,
  so there is no access key to leak, rotate, or commit.

## Tech stack

Vite · React · TypeScript · Tailwind CSS · [Motion](https://motion.dev) ·
[vaul](https://vaul.emilkowal.ski) · [Lenis](https://lenis.dev) ·
[lucide-animated](https://lucide-animated.com) · [ThiingsGrid](https://github.com/charlieclark/thiings-grid)
Deployed on Cloudflare Pages with assets on R2.

## Local development

```bash
npm install
npm run dev          # UI only; /api/download returns a readable error
npm run pages:dev    # app + download function with the R2 binding live
```

Source icons live in `Assets/Images/<Pack Name>/<Icon Name>.png` and are **not committed** —
they are 2048px masters totalling ~258MB. Dev generates and caches the 256px preview tier
on first request in `node_modules/.cache/objectly-preview/`, so the browser never receives a
master. Delete that folder to regenerate.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server (regenerates manifests first) |
| `npm run pages:dev` | Wrangler Pages dev, with the R2 binding |
| `npm run build` | Type-check and build to `dist/` |
| `npm run generate:icons` | Rebuilds the client and server manifests from `Assets/Images/` |
| `npm run prepare:assets` | Writes `dist-assets/preview/` and `dist-assets/full/` for upload; never touches sources |
| `npm run check:descriptions` | Lists manifest ids missing a description |
| `npm run subset:fonts` | Regenerates the Latin-subset woff2 files |

## Architecture notes

**Manifests are generated, never hand-edited.** `scripts/generate-manifest.mjs` scans
`Assets/Images/` and emits two files: `src/data/icons.generated.ts` for the client (preview
paths only) and `functions/icons.generated.ts` for the Pages Function (id → R2 key). The
client manifest never contains a full-resolution path.

**Object keys are slugs.** `preview/ai/ai-chip.png`, `full/ai/ai-chip.png`. Display names
("AI Chip") live only in the manifest and are used for the download filename, so no key
contains a space or a character needing URL-encoding.

**Descriptions are authored, not generated at runtime.** All 240 live in
`src/data/descriptions.ts`; a missing id falls back to a neutral template rather than an
empty gap. `npm run check:descriptions` reports gaps.

**Fonts.** Only weights 400 and 500 are referenced, so only those ship, Latin-subset —
636kB → 57kB. All four full weights remain in `Assets/OpenRunde/`. To use another weight,
add it to `WEIGHTS` in `scripts/subset-fonts.mjs`, re-run `npm run subset:fonts`, and add a
matching `@font-face` rule in `src/index.css`.

## Anti-scraping posture

Preview images are public and aggressively cached by design. Full-resolution files live under
`full/` in the same bucket, are not exposed through the CDN subdomain, and are only read
server-side by `functions/api/download.ts`, which resolves an `id` against the generated
manifest rather than concatenating user input into an object key.

This raises the cost of bulk mirroring. It does not prevent scraping — anything a browser can
load, a script can fetch. That trade-off is deliberate: the preview tier is the lowest-value
tier to protect and the one that benefits most from being cacheable.

## Licence

Icons are free for commercial use; attribution appreciated, not required.
[Open Runde](https://github.com/lauridskern/open-runde) is OFL-1.1.
