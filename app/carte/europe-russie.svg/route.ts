import { renderBaseMapSvg } from "@/lib/geo";

/**
 * Base layer of the route map (land, borders, graticule), generated once at
 * build time and served as a plain image, so it stays out of the HTML and
 * the RSC payload.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(renderBaseMapSvg(), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
