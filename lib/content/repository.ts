import { access, mkdir, readdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  parseMarkdownDocument,
  parseMarkdownImportDocument,
  stringifyMarkdownDocument,
  type ParsedMarkdownDocument
} from "@/lib/markdown/import";
import { topicCatalog } from "@/lib/content/topic-catalog";
import type { PostRecord, PostStatus, TopicRecord } from "@/lib/types";

const postsDir = path.join(process.cwd(), "content", "posts");
const topicsFile = path.join(process.cwd(), "content", "topics.json");

type StoredTopic = {
  slug: string;
  name: string;
  description: string;
  accentColor: string;
  coverImage?: string;
};

type TopicInput = {
  name: string;
  slug: string;
  description: string;
  accentColor: string;
  coverImage?: string;
};

export type PostInput = {
  title: string;
  slug: string;
  summary: string;
  coverImage?: string;
  topicSlug: string;
  tags: string[];
  status: PostStatus;
  isFeatured: boolean;
  publishedAt?: string;
  contentMarkdown: string;
};

async function ensurePostsDir() {
  await mkdir(postsDir, { recursive: true });
}

async function ensureTopicsFile() {
  await mkdir(path.dirname(topicsFile), { recursive: true });

  try {
    await access(topicsFile);
  } catch {
    await writeFile(topicsFile, JSON.stringify(topicCatalog, null, 2), "utf8");
  }
}

function sortPosts(posts: PostRecord[]) {
  return posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

function mapDocumentToPost(document: ParsedMarkdownDocument, topics: StoredTopic[]): PostRecord {
  const topic = topics.find((item) => item.slug === document.topic);

  return {
    id: document.slug,
    title: document.title,
    slug: document.slug,
    summary: document.summary,
    coverImage: document.coverImage,
    topicSlug: document.topic,
    topicName: topic?.name || document.topic,
    accentColor: topic?.accentColor || "#00f6ff",
    tags: document.tags,
    publishedAt: document.publishedAt || new Date().toISOString(),
    readingTime: Math.max(1, Math.ceil(document.contentMarkdown.split(/\s+/).length / 220)),
    isFeatured: document.featured,
    status: document.status,
    contentMarkdown: document.contentMarkdown
  };
}

async function readPostDocuments() {
  await ensurePostsDir();
  const filenames = await readdir(postsDir);
  const markdownFiles = filenames.filter((name) => name.endsWith(".md"));
  const topics = await readTopicCatalog();

  const documents = await Promise.all(
    markdownFiles.map(async (filename) => {
      const source = await readFile(path.join(postsDir, filename), "utf8");
      return parseMarkdownDocument(source);
    })
  );

  return documents.map((document) => mapDocumentToPost(document, topics));
}

async function readTopicCatalog(): Promise<StoredTopic[]> {
  await ensureTopicsFile();
  const source = await readFile(topicsFile, "utf8");
  return JSON.parse(source) as StoredTopic[];
}

async function writeTopicCatalog(topics: StoredTopic[]) {
  await ensureTopicsFile();
  await writeFile(topicsFile, JSON.stringify(topics, null, 2), "utf8");
}

async function rewriteTopicSlugInPosts(previousSlug: string, nextSlug: string) {
  if (previousSlug === nextSlug) {
    return;
  }

  await ensurePostsDir();
  const filenames = await readdir(postsDir);
  const markdownFiles = filenames.filter((name) => name.endsWith(".md"));

  await Promise.all(
    markdownFiles.map(async (filename) => {
      const filePath = path.join(postsDir, filename);
      const source = await readFile(filePath, "utf8");
      const document = parseMarkdownDocument(source);

      if (document.topic !== previousSlug) {
        return;
      }

      const nextDocument = stringifyMarkdownDocument({
        ...document,
        topic: nextSlug
      });

      await writeFile(filePath, nextDocument, "utf8");
    })
  );
}

function getPostFilePath(slug: string) {
  return path.join(postsDir, `${slug}.md`);
}

export async function getTopics(): Promise<TopicRecord[]> {
  const posts = await getPublishedPosts();
  const topicCatalog = await readTopicCatalog();

  return topicCatalog.map((topic) => ({
    id: `topic-${topic.slug}`,
    name: topic.name,
    slug: topic.slug,
    description: topic.description,
    accentColor: topic.accentColor,
    coverImage: topic.coverImage,
    postCount: posts.filter((post) => post.topicSlug === topic.slug).length || 0
  }));
}

export async function getTopicBySlug(slug: string) {
  const topicCatalog = await readTopicCatalog();
  const topic = topicCatalog.find((item) => item.slug === slug);

  if (!topic) {
    return null;
  }

  const topics = await getTopics();
  return topics.find((item) => item.slug === slug) || null;
}

export async function getPublishedPosts() {
  const posts = await readPostDocuments();
  return sortPosts(posts.filter((post) => post.status === "published"));
}

export async function getAllPosts() {
  return sortPosts(await readPostDocuments());
}

export async function getFeaturedPosts() {
  const posts = await readPostDocuments();
  return sortPosts(posts.filter((post) => post.isFeatured && post.status === "published"));
}

export async function getPostBySlug(slug: string) {
  const posts = await readPostDocuments();
  const decodedSlug = (() => {
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  })();

  return posts.find((post) => post.slug === slug || post.slug === decodedSlug) ?? null;
}

export async function getPostById(id: string) {
  return getPostBySlug(id);
}

export async function getPostsByTopicSlug(topicSlug: string) {
  const posts = await readPostDocuments();
  return sortPosts(posts.filter((post) => post.topicSlug === topicSlug && post.status === "published"));
}

export async function getRelatedPosts(currentSlug: string, topicSlug: string) {
  const posts = await readPostDocuments();
  return posts
    .filter((post) => post.slug !== currentSlug && post.topicSlug === topicSlug && post.status === "published")
    .slice(0, 3);
}

export async function getDashboardMetrics() {
  const posts = await readPostDocuments();

  return {
    publishedPosts: posts.filter((post) => post.status === "published").length,
    draftPosts: posts.filter((post) => post.status === "draft").length
  };
}

export async function getTagSummary() {
  const posts = await getPublishedPosts();
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getTopicOptions() {
  const topicCatalog = await readTopicCatalog();
  return topicCatalog.map((topic) => ({
    slug: topic.slug,
    name: topic.name
  }));
}

export async function savePost(input: PostInput, previousSlug?: string) {
  await ensurePostsDir();
  const normalizedSlug = input.slug.trim();
  const publishedAt = input.publishedAt?.trim() || new Date().toISOString();

  const document = stringifyMarkdownDocument({
    title: input.title.trim(),
    slug: normalizedSlug,
    summary: input.summary.trim(),
    coverImage: input.coverImage?.trim() || undefined,
    topic: input.topicSlug,
    tags: input.tags,
    publishedAt,
    status: input.status,
    featured: input.isFeatured,
    contentMarkdown: input.contentMarkdown.trim()
  });

  const targetPath = getPostFilePath(normalizedSlug);
  const originalSlug = previousSlug?.trim();

  if (originalSlug && originalSlug !== normalizedSlug) {
    const originalPath = getPostFilePath(originalSlug);
    await access(originalPath);
    await rename(originalPath, targetPath);
  }

  await writeFile(targetPath, document, "utf8");

  return normalizedSlug;
}

export async function importMarkdownPost(source: string, defaultTopic?: string, overrideCoverImage?: string) {
  const document = parseMarkdownImportDocument(source, {
    mode: "import",
    defaultTopic
  });
  return savePost(
    {
      title: document.title,
      slug: document.slug,
      summary: document.summary,
      coverImage: overrideCoverImage || document.coverImage,
      topicSlug: document.topic,
      tags: document.tags,
      status: document.status,
      isFeatured: document.featured,
      publishedAt: document.publishedAt,
      contentMarkdown: document.contentMarkdown
    },
    document.slug
  );
}

export async function deletePost(slug: string) {
  await ensurePostsDir();
  await unlink(getPostFilePath(slug));
}

export async function createTopic(input: TopicInput) {
  const topics = await readTopicCatalog();

  if (topics.some((topic) => topic.slug === input.slug)) {
    throw new Error("专题 slug 已存在，请更换一个。");
  }

  const nextTopics = [...topics, input];
  await writeTopicCatalog(nextTopics);
}

export async function updateTopic(previousSlug: string, input: TopicInput) {
  const topics = await readTopicCatalog();

  if (!topics.some((topic) => topic.slug === previousSlug)) {
    throw new Error("要更新的专题不存在。");
  }

  if (previousSlug !== input.slug && topics.some((topic) => topic.slug === input.slug)) {
    throw new Error("新的专题 slug 已存在，请更换一个。");
  }

  const nextTopics = topics.map((topic) => (topic.slug === previousSlug ? input : topic));
  await writeTopicCatalog(nextTopics);
  await rewriteTopicSlugInPosts(previousSlug, input.slug);
}

export async function removeTopic(slug: string) {
  const posts = await getAllPosts();

  if (posts.some((post) => post.topicSlug === slug)) {
    throw new Error("该专题下仍有文章，不能直接删除。请先移动或删除这些文章。");
  }

  const topics = await readTopicCatalog();
  const nextTopics = topics.filter((topic) => topic.slug !== slug);

  if (nextTopics.length === topics.length) {
    throw new Error("专题不存在。");
  }

  await writeTopicCatalog(nextTopics);
}
