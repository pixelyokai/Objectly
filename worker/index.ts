import { iconsById } from "./icons.generated";

interface Env {
  ASSETS: Fetcher;
  ICONS: R2Bucket;
}

// Static assets are matched first by the platform; this fetch handler only runs
// for paths that don't correspond to a file in dist/ (see wrangler.toml).
export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/download") return handleDownload(url, env);
    if (url.pathname.startsWith("/preview/")) return handlePreview(url, env);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

// The full/ prefix is deliberately absent from the client manifest; ids are
// resolved to keys here so no user input reaches R2. hasOwn, not a plain
// lookup, so "constructor" and friends can't resolve.
async function handleDownload(url: URL, env: Env): Promise<Response> {
  const id = url.searchParams.get("id");
  if (!id || !Object.hasOwn(iconsById, id)) return new Response("Not found", { status: 404 });

  const { name, key } = iconsById[id];
  const object = await env.ICONS.get(`full/${key}`);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${name}.png"`,
      "Cache-Control": "private, no-store",
    },
  });
}

// Public and cacheable by design — this is the low-value tier the site's grid
// runs on. Still resolved through the manifest, not the raw URL, so a request
// can't walk the bucket outside its preview/ prefix.
//
// max-age is long but not "immutable": the key (icon id) is stable even if the
// underlying artwork is ever replaced, so a genuine content change relies on
// this TTL expiring or an edge-cache purge, not on a new filename.
async function handlePreview(url: URL, env: Env): Promise<Response> {
  const id = url.pathname.slice("/preview/".length).replace(/\.png$/, "");
  if (!Object.hasOwn(iconsById, id)) return new Response("Not found", { status: 404 });

  const object = await env.ICONS.get(`preview/${iconsById[id].key}`);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=2592000",
    },
  });
}
