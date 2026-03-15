import { getPublishedPosts } from "@/lib/content/repository";
import { siteConfig } from "@/lib/site-config";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts
    .map(
      (post) => `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${siteConfig.url}/posts/${encodeURIComponent(post.slug)}</link>
          <guid>${siteConfig.url}/posts/${encodeURIComponent(post.slug)}</guid>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
          <description>${escapeXml(post.summary)}</description>
        </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}
