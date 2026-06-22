export interface OgData {
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
}

function resolveUrl(base: string, maybeRelative: string): string {
  try {
    return new URL(maybeRelative, base).href;
  } catch {
    return maybeRelative;
  }
}

export async function scrapeOg(url: string): Promise<OgData> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BookmarkApp/1.0)" },
    });
    const html = await res.text();
    const og: OgData = { title: null, description: null, image: null, favicon: null };

    og.title = extractMeta(html, "og:title") ?? extractMeta(html, "twitter:title") ?? extractTag(html, "title") ?? new URL(url).hostname;

    og.description =
      extractMeta(html, "og:description") ??
      extractMeta(html, "twitter:description") ??
      extractMeta(html, "description") ??
      null;

    const rawImage = extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image");
    if (rawImage) og.image = resolveUrl(url, rawImage);

    const faviconLink = extractAttr(html, "link[rel~='icon']", "href") ?? extractAttr(html, "link[rel='shortcut icon']", "href");
    if (faviconLink) {
      og.favicon = faviconLink.startsWith("data:") ? null : resolveUrl(url, faviconLink);
    }
    if (!og.favicon) {
      og.favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
    }

    return og;
  } catch {
    return { title: new URL(url).hostname, description: null, image: null, favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64` };
  }
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta\\s[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta\\s[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, "i"),
    new RegExp(`<meta\\s[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta\\s[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractTag(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return match ? match[1].trim() : null;
}

function extractAttr(html: string, selector: string, attr: string): string | null {
  const match = html.match(new RegExp(`<${selector}[^>]*${attr}=["']([^"']*)["']`, "i"));
  return match ? match[1] : null;
}
