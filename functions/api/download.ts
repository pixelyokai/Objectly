import { iconsById } from "../icons.generated";

// The full/ prefix is deliberately absent from the manifest and the client
// bundle; ids are resolved to keys here so no user input reaches R2.
// hasOwn, not a plain lookup, so "constructor" and friends can't resolve.
export const onRequestGet: PagesFunction<{ ICONS: R2Bucket }> = async ({ request, env }) => {
  const id = new URL(request.url).searchParams.get("id");
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
};
