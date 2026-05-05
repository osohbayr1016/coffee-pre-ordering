/** Slugs for static export; falls back to seed shop if API unreachable at build time. */
export async function buildShopSlugParams(): Promise<{ slug: string }[]> {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://coffee-api.osohoo691016.workers.dev/v1";
  try {
    const res = await fetch(`${base}/shops`, { cache: "no-store" });
    if (!res.ok) throw new Error("shops fetch failed");
    const shops = (await res.json()) as { slug?: string }[];
    const slugs = shops.map((s) => s.slug).filter(Boolean) as string[];
    if (!slugs.length) return [{ slug: "gobi-coffee" }];
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [{ slug: "gobi-coffee" }];
  }
}
