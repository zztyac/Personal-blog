import type { MetadataRoute } from "next";
import { getPublishedPosts, getTopics } from "@/lib/content/repository";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, topics] = await Promise.all([getPublishedPosts(), getTopics()]);

  return [
    {
      url: siteConfig.url,
      lastModified: new Date()
    },
    {
      url: `${siteConfig.url}/archive`,
      lastModified: new Date()
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date()
    },
    ...topics.map((topic) => ({
      url: `${siteConfig.url}/topics/${topic.slug}`,
      lastModified: new Date()
    })),
    ...posts.map((post) => ({
      url: `${siteConfig.url}/posts/${encodeURIComponent(post.slug)}`,
      lastModified: new Date(post.publishedAt)
    }))
  ];
}
