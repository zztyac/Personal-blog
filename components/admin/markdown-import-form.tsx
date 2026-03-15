"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type TopicOption = {
  slug: string;
  name: string;
};

type MarkdownImportFormProps = {
  topics: TopicOption[];
  initialError?: string;
};

export function MarkdownImportForm({ topics, initialError }: MarkdownImportFormProps) {
  const router = useRouter();
  const [error, setError] = useState(initialError || "");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="stack"
      encType="multipart/form-data"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setError("");

        startTransition(async () => {
          const response = await fetch("/api/admin/import-markdown", {
            method: "POST",
            body: formData
          });

          const data = (await response.json().catch(() => null)) as
            | {
                ok?: boolean;
                error?: string;
                redirectTo?: string;
              }
            | null;

          if (!response.ok || !data?.ok || !data.redirectTo) {
            setError(data?.error || "Markdown 导入失败，请重试。");
            if (response.status === 401) {
              router.push("/admin/login");
            }
            return;
          }

          router.push(data.redirectTo);
          router.refresh();
        });
      }}
    >
      <div className="field">
        <label htmlFor="fallbackTopicSlug">默认专题（当 Markdown 里没有 topic 时使用）</label>
        <select id="fallbackTopicSlug" name="fallbackTopicSlug" defaultValue="frontend-systems">
          {topics.map((topic) => (
            <option key={topic.slug} value={topic.slug}>
              {topic.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="markdownFile">上传 Markdown 文件</label>
        <input id="markdownFile" name="markdownFile" type="file" accept=".md,text/markdown" />
      </div>
      <div className="field">
        <label htmlFor="markdownAssets">上传 Markdown 附带的本地图片</label>
        <input id="markdownAssets" name="markdownAssets" type="file" accept="image/*" multiple />
      </div>
      <div className="field">
        <label htmlFor="coverImageFile">上传文章封面</label>
        <input id="coverImageFile" name="coverImageFile" type="file" accept="image/*" />
      </div>
      <div className="field">
        <label htmlFor="coverImageUrl">或填写文章封面 URL</label>
        <input id="coverImageUrl" name="coverImageUrl" placeholder="/uploads/post-covers/..." />
      </div>
      <div className="field">
        <label htmlFor="markdownText">或粘贴 Markdown 文本</label>
        <textarea
          id="markdownText"
          name="markdownText"
          placeholder="---&#10;title: Hello&#10;slug: hello&#10;summary: ...&#10;topic: frontend-systems&#10;tags: [react]&#10;status: draft&#10;featured: false&#10;---&#10;&#10;# Title&#10;&#10;Content"
        />
      </div>
      {error ? <p className="admin-copy" style={{ color: "#ff8fcb" }}>{error}</p> : null}
      <button type="submit" className="button-secondary" disabled={isPending}>
        {isPending ? "导入中..." : "导入 Markdown 创建文章"}
      </button>
    </form>
  );
}
