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
