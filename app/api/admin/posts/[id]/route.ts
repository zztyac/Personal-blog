import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, hasAdminSessionValue } from "@/lib/auth/admin";
import { savePost } from "@/lib/content/repository";
import type { PostStatus } from "@/lib/types";

type PostPayload = {
  title?: string;
  slug?: string;
  summary?: string;
  coverImage?: string;
  topicSlug?: string;
  status?: PostStatus;
  publishedAt?: string;
  tags?: string[];
  isFeatured?: boolean;
  contentMarkdown?: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getSessionValue(request: Request) {
  return (request.headers.get("cookie") || "")
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

function normalizePayload(body: PostPayload) {
  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim();
  const summary = String(body.summary || "").trim();
  const coverImage = String(body.coverImage || "").trim();
  const topicSlug = String(body.topicSlug || "").trim();
  const contentMarkdown = String(body.contentMarkdown || "").trim();
  const status = (body.status || "draft") as PostStatus;
  const publishedAt = String(body.publishedAt || "").trim();
  const tags = Array.isArray(body.tags) ? body.tags.map((item) => String(item).trim()).filter(Boolean) : [];

  if (!title || !slug || !summary || !topicSlug || !contentMarkdown) {
    throw new Error("缺少必填字段");
  }

  return {
    title,
    slug,
    summary,
    coverImage,
    topicSlug,
    status,
    publishedAt,
    contentMarkdown,
    tags,
    isFeatured: Boolean(body.isFeatured)
  };
}

function revalidatePublicPaths(slug: string, topicSlug: string) {
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/posts/${slug}`);
  revalidatePath(`/topics/${topicSlug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
}

export async function PUT(request: Request, context: RouteContext) {
  if (!hasAdminSessionValue(getSessionValue(request))) {
    return NextResponse.json({ ok: false, error: "未登录或登录已失效，请重新登录。" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const previousSlug = decodeURIComponent(id);
    const body = (await request.json()) as PostPayload;
    const payload = normalizePayload(body);
    const slug = await savePost(payload, previousSlug);

    if (previousSlug !== slug) {
      revalidatePath(`/posts/${previousSlug}`);
    }

    revalidatePublicPaths(slug, payload.topicSlug);

    return NextResponse.json({
      ok: true,
      redirectTo: `/admin/posts/${encodeURIComponent(slug)}/edit?saved=1`
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "文章更新失败。"
      },
      { status: 500 }
    );
  }
}
