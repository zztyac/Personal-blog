"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { MarkdownAssetUploader } from "@/components/admin/markdown-asset-uploader";
import { MarkdownContent } from "@/components/site/markdown-content";
import type { PostRecord, PostStatus } from "@/lib/types";

type TopicOption = {
  slug: string;
  name: string;
};

type EditorShellProps = {
  post?: PostRecord;
  topics: TopicOption[];
};

const emptyPost: Partial<PostRecord> = {
  title: "Untitled Signal",
  slug: "untitled-signal",
  summary: "为这篇文章补一段摘要，让列表页和分享卡片更完整。",
  topicSlug: "frontend-systems",
  status: "draft",
  tags: [],
  isFeatured: false,
  contentMarkdown: `## Draft

在这里编写 Markdown 正文。

- 支持列表
- 支持代码块
- 支持引用

\`\`\`ts
export const signal = "online";
\`\`\``
};

export function EditorShell({ post, topics }: EditorShellProps) {
  const router = useRouter();
  const current = { ...emptyPost, ...post };
  const storageKey = `neon-editor-draft:${post?.slug || "new-post"}`;
  const [title, setTitle] = useState(current.title || "");
  const [slug, setSlug] = useState(current.slug || "");
  const [summary, setSummary] = useState(current.summary || "");
  const [coverImage, setCoverImage] = useState(current.coverImage || "");
  const [topicSlug, setTopicSlug] = useState(current.topicSlug || "frontend-systems");
  const [status, setStatus] = useState<PostStatus>(current.status || "draft");
  const [publishedAt, setPublishedAt] = useState(current.publishedAt || "");
  const [tags, setTags] = useState((current.tags || []).join(", "));
  const [isFeatured, setIsFeatured] = useState(Boolean(current.isFeatured));
  const [contentMarkdown, setContentMarkdown] = useState(current.contentMarkdown || "");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return;
    }

    try {
      const draft = JSON.parse(raw) as Partial<{
        title: string;
        slug: string;
        summary: string;
        coverImage: string;
        topicSlug: string;
        status: PostStatus;
        publishedAt: string;
        tags: string;
        isFeatured: boolean;
        contentMarkdown: string;
      }>;

      if (draft.title) setTitle(draft.title);
      if (draft.slug) setSlug(draft.slug);
      if (draft.summary) setSummary(draft.summary);
      if (typeof draft.coverImage === "string") setCoverImage(draft.coverImage);
      if (draft.topicSlug) setTopicSlug(draft.topicSlug);
      if (draft.status) setStatus(draft.status);
      if (typeof draft.publishedAt === "string") setPublishedAt(draft.publishedAt);
      if (typeof draft.tags === "string") setTags(draft.tags);
      if (typeof draft.isFeatured === "boolean") setIsFeatured(draft.isFeatured);
      if (typeof draft.contentMarkdown === "string") setContentMarkdown(draft.contentMarkdown);
      setDraftLoaded(true);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          title,
          slug,
          summary,
          coverImage,
          topicSlug,
          status,
          publishedAt,
          tags,
          isFeatured,
          contentMarkdown
        })
      );
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [contentMarkdown, coverImage, isFeatured, publishedAt, slug, status, storageKey, summary, tags, title, topicSlug]);

  async function submitToApi(nextStatus: PostStatus) {
    const endpoint = post?.slug ? `/api/admin/posts/${encodeURIComponent(post.slug)}` : "/api/admin/posts";
    const method = post?.slug ? "PUT" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        slug,
        summary,
        coverImage,
        topicSlug,
        status: nextStatus,
        publishedAt,
        tags: tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        isFeatured,
        contentMarkdown
      })
    });

    const data = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
          redirectTo?: string;
        }
      | null;

    if (!response.ok || !data?.ok || !data.redirectTo) {
      setError(data?.error || "文章保存失败，请重试。");

      if (response.status === 401) {
        router.push("/admin/login");
      }

      return;
    }

    window.localStorage.removeItem(storageKey);
    router.push(data.redirectTo);
    router.refresh();
  }

  return (
    <form
      className="editor-shell"
      onSubmit={(event) => {
        event.preventDefault();
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const nextStatus: PostStatus = submitter?.value === "published" ? "published" : "draft";

        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            title,
            slug,
            summary,
            coverImage,
            topicSlug,
            status,
            publishedAt,
            tags,
            isFeatured,
            contentMarkdown
          })
        );

        setError("");
        startTransition(async () => {
          await submitToApi(nextStatus);
        });
      }}
    >
      <div className="eyebrow-row">
        <span className="admin-caption">Editor Surface</span>
        <div className="pill-list">
          <span className="pill">{status}</span>
          <span className="pill">Live Preview</span>
          {draftLoaded ? <span className="pill">Local Draft Restored</span> : null}
        </div>
      </div>

      <div className="editor-grid">
        <div className="stack">
          <div className="field">
            <label htmlFor="title">标题</label>
            <input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="summary">摘要</label>
            <textarea
              id="summary"
              name="summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              style={{ minHeight: 120 }}
            />
          </div>
          <ImageUploadField label="文章封面" folder="post-covers" value={coverImage} onChange={setCoverImage} />
          <div className="field">
            <label htmlFor="topicSlug">专题</label>
            <select id="topicSlug" name="topicSlug" value={topicSlug} onChange={(event) => setTopicSlug(event.target.value)}>
              {topics.map((topic) => (
                <option key={topic.slug} value={topic.slug}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">状态</label>
            <select id="status" name="status" value={status} onChange={(event) => setStatus(event.target.value as PostStatus)}>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>
          <p className="admin-copy">前台只展示已发布文章。导入后的文章默认是草稿，点击“立即发布”后才会出现在前台。</p>
          <div className="field">
            <label htmlFor="publishedAt">发布时间（ISO）</label>
            <input
              id="publishedAt"
              name="publishedAt"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              placeholder="2026-03-15T08:00:00.000Z"
            />
          </div>
          <div className="field">
            <label htmlFor="tags">标签（逗号分隔）</label>
            <input id="tags" name="tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="react, architecture" />
          </div>
          <label className="post-meta">
            <input type="checkbox" name="isFeatured" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
            <span>设为精选文章</span>
          </label>
          <div className="field">
            <label htmlFor="content">Markdown 正文</label>
            <textarea id="content" name="contentMarkdown" value={contentMarkdown} onChange={(event) => setContentMarkdown(event.target.value)} />
          </div>
          <MarkdownAssetUploader onInsert={(snippet) => setContentMarkdown((currentMarkdown) => `${currentMarkdown}${snippet}`)} />
          {error ? <p className="admin-copy" style={{ color: "#ff8fcb" }}>{error}</p> : null}
          <div className="editor-actions">
            <button type="submit" name="editorIntent" value="draft" className="button-secondary" disabled={isPending}>
              {isPending ? "保存中..." : "保存草稿"}
            </button>
            <button type="submit" name="editorIntent" value="published" className="button-primary" disabled={isPending}>
              {isPending ? "保存中..." : status === "published" ? "更新并保持发布" : "立即发布"}
            </button>
          </div>
        </div>

        <div className="stack">
          <div className="toolbar-card stack">
            <span className="admin-caption">Preview</span>
            <h2 className="admin-heading">{title || "Untitled Signal"}</h2>
            <p className="admin-copy">{summary || "这里会实时显示文章摘要预览。"}</p>
            {coverImage ? (
              <div className="image-preview" style={{ minHeight: 200 }}>
                <img src={coverImage} alt={title || "文章封面"} />
              </div>
            ) : null}
            <div className="pill-list">
              <span className="pill">{topicSlug}</span>
              <span className="pill">{status}</span>
            </div>
          </div>
          <div className="panel article-body">
            <MarkdownContent source={contentMarkdown || "## Empty\n\n开始输入内容后，这里会实时预览。"} />
          </div>
        </div>
      </div>
    </form>
  );
}
