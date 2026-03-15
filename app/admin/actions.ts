"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTopic, deletePost, removeTopic, savePost, updateTopic } from "@/lib/content/repository";
import { loginAdmin, logoutAdmin, requireAdmin } from "@/lib/auth/admin";
import type { PostStatus } from "@/lib/types";

function normalizeTags(raw: FormDataEntryValue | null) {
  return String(raw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPostPayload(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();
  const topicSlug = String(formData.get("topicSlug") || "").trim();
  const intent = String(formData.get("editorIntent") || "").trim();
  const status = (intent === "published"
    ? "published"
    : intent === "draft"
      ? "draft"
      : String(formData.get("status") || "draft")) as PostStatus;
  const publishedAt = String(formData.get("publishedAt") || "").trim();
  const contentMarkdown = String(formData.get("contentMarkdown") || "").trim();

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
    tags: normalizeTags(formData.get("tags")),
    isFeatured: formData.get("isFeatured") === "on"
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

function slugifyTopic(value: string) {
  return value
    .toLowerCase()
    .replace(/[`~!@#$%^&*()+=<>{}\[\]\\|:;"',.?/]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const ok = await loginAdmin(password);

  if (!ok) {
    redirect("/admin/login?error=1");
  }

  redirect("/admin");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/admin/login");
}

export async function createPostAction(formData: FormData) {
  await requireAdmin();
  const payload = getPostPayload(formData);
  const slug = await savePost(payload);
  revalidatePublicPaths(slug, payload.topicSlug);
  redirect(`/admin/posts/${encodeURIComponent(slug)}/edit?saved=1`);
}

export async function updatePostAction(formData: FormData) {
  await requireAdmin();
  const previousSlug = String(formData.get("previousSlug") || "").trim();
  const payload = getPostPayload(formData);
  const slug = await savePost(payload, previousSlug);

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/posts/${previousSlug}`);
  }

  revalidatePublicPaths(slug, payload.topicSlug);
  redirect(`/admin/posts/${encodeURIComponent(slug)}/edit?saved=1`);
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") || "").trim();

  if (!slug) {
    throw new Error("缺少文章 slug");
  }

  await deletePost(slug);
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?deleted=1");
}

export async function createTopicAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const slug = slugifyTopic(String(formData.get("slug") || "").trim() || name);
  const description = String(formData.get("description") || "").trim();
  const accentColor = String(formData.get("accentColor") || "#00f6ff").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();

  if (!name || !slug || !description) {
    redirect("/admin/topics?error=" + encodeURIComponent("请填写专题名称、slug 和描述。"));
  }

  try {
    await createTopic({
      name,
      slug,
      description,
      accentColor,
      coverImage
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建专题失败。";
    redirect("/admin/topics?error=" + encodeURIComponent(message));
  }

  revalidatePath("/");
  revalidatePath("/admin/topics");
  redirect("/admin/topics?created=1");
}

export async function updateTopicAction(formData: FormData) {
  await requireAdmin();
  const previousSlug = String(formData.get("previousSlug") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const slug = slugifyTopic(String(formData.get("slug") || "").trim() || name);
  const description = String(formData.get("description") || "").trim();
  const accentColor = String(formData.get("accentColor") || "#00f6ff").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();

  if (!previousSlug || !name || !slug || !description) {
    redirect("/admin/topics?error=" + encodeURIComponent("请完整填写专题信息。"));
  }

  try {
    await updateTopic(previousSlug, {
      name,
      slug,
      description,
      accentColor,
      coverImage
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新专题失败。";
    redirect("/admin/topics?error=" + encodeURIComponent(message));
  }

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin/topics");
  redirect("/admin/topics?updated=1");
}

export async function deleteTopicAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") || "").trim();

  if (!slug) {
    redirect("/admin/topics?error=" + encodeURIComponent("缺少专题 slug。"));
  }

  try {
    await removeTopic(slug);
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除专题失败。";
    redirect("/admin/topics?error=" + encodeURIComponent(message));
  }

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin/topics");
  redirect("/admin/topics?deleted=1");
}
