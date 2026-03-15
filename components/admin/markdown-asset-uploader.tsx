"use client";

import { useRef, useState } from "react";

type MarkdownAssetUploaderProps = {
  onInsert: (snippet: string) => void;
};

export function MarkdownAssetUploader({ onInsert }: MarkdownAssetUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="stack" style={{ gap: 10 }}>
      <button type="button" className="button-secondary table-action" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        {isUploading ? "上传中..." : "上传正文图片"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          setError("");
          setIsUploading(true);

          try {
            const formData = new FormData();
            formData.append("folder", "markdown-inline");
            formData.append("file", file);

            const response = await fetch("/api/admin/upload-image", {
              method: "POST",
              body: formData
            });

            const data = (await response.json()) as { ok?: boolean; url?: string; error?: string };

            if (!response.ok || !data.ok || !data.url) {
              throw new Error(data.error || "正文图片上传失败。");
            }

            onInsert(`\n\n![${file.name}](${data.url})\n`);
          } catch (uploadError) {
            setError(uploadError instanceof Error ? uploadError.message : "正文图片上传失败。");
          } finally {
            setIsUploading(false);
            event.target.value = "";
          }
        }}
      />
      {error ? <p className="admin-copy" style={{ color: "#ff8fcb" }}>{error}</p> : null}
    </div>
  );
}
