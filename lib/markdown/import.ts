import matter from "gray-matter";
import { z } from "zod";

const frontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  coverImage: z.string().optional(),
  topic: z.string().min(1),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false)
});

const importFrontmatterSchema = z.object({
  title: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(1).optional(),
  coverImage: z.string().trim().min(1).optional(),
  topic: z.string().trim().min(1).optional(),
  tags: z
    .preprocess((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === "string") {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return [];
    }, z.array(z.string()))
    .default([]),
  publishedAt: z.string().trim().min(1).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false)
});

export type ParsedMarkdownDocument = z.infer<typeof frontmatterSchema> & {
  contentMarkdown: string;
};

type ParseMarkdownOptions = {
  mode?: "strict" | "import";
  defaultTopic?: string;
};

function slugify(value: string) {
  const asciiSlug = value
    .toLowerCase()
    .replace(/[`~!@#$%^&*()+=<>{}\[\]\\|:;"',.?/]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (asciiSlug && /^[\x00-\x7F-]+$/.test(asciiSlug)) {
    return asciiSlug;
  }

  return "";
}

function extractHeading(content: string) {
  const line = content
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith("# "));

  return line ? line.replace(/^#\s+/, "").trim() : "";
}

function extractSummary(content: string) {
  const paragraph = content
    .split(/\r?\n\r?\n/)
    .map((item) => item.replace(/\r?\n/g, " ").trim())
    .find((item) => item && !item.startsWith("#") && !item.startsWith("```"));

  if (!paragraph) {
    return "";
  }

  return paragraph.length > 140 ? `${paragraph.slice(0, 137)}...` : paragraph;
}

export function parseMarkdownDocument(source: string): ParsedMarkdownDocument {
  const parsed = matter(source);
  const frontmatter = frontmatterSchema.parse(parsed.data);

  return {
    ...frontmatter,
    contentMarkdown: parsed.content.trim()
  };
}

export function parseMarkdownImportDocument(source: string, options?: ParseMarkdownOptions): ParsedMarkdownDocument {
  const parsed = matter(source);
  const frontmatter = importFrontmatterSchema.parse(parsed.data);
  const contentMarkdown = parsed.content.trim();
  const heading = extractHeading(contentMarkdown);
  const title = frontmatter.title || heading || `Imported Post ${new Date().toISOString().slice(0, 10)}`;
  const slug = slugify(frontmatter.slug || title) || `post-${Date.now()}`;
  const summary =
    frontmatter.summary ||
    extractSummary(contentMarkdown) ||
    "Imported from Markdown. Please refine the summary in the editor.";
  const topic = frontmatter.topic || options?.defaultTopic || "frontend-systems";

  return {
    title,
    slug,
    summary,
    coverImage: frontmatter.coverImage,
    topic,
    tags: frontmatter.tags,
    publishedAt: frontmatter.publishedAt,
    status: frontmatter.status,
    featured: frontmatter.featured,
    contentMarkdown
  };
}

export function stringifyMarkdownDocument(document: ParsedMarkdownDocument) {
  const frontmatter = Object.fromEntries(
    Object.entries({
      title: document.title,
      slug: document.slug,
      summary: document.summary,
      coverImage: document.coverImage,
      topic: document.topic,
      tags: document.tags,
      publishedAt: document.publishedAt,
      status: document.status,
      featured: document.featured
    }).filter(([, value]) => value !== undefined)
  );

  return matter.stringify(document.contentMarkdown, frontmatter);
}
