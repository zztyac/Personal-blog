"use client";

import { useRef, useState } from "react";

type ImageUploadFieldProps = {
  label: string;
  folder: string;
  value: string;
  onChange: (url: string) => void;
  previewHeight?: number;
};

export function ImageUploadField({ label, folder, value, onChange, previewHeight = 180 }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="field">
      <label>{label}</label>
      <div className="stack">
        <div className="cover-upload">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/uploads/post-covers/..."
          />
          <button type="button" className="button-secondary table-action" onClick={() => inputRef.current?.click()} disabled={isUploading}>
            {isUploading ? "上传中..." : "上传图片"}
          </button>
        </div>
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
              formData.append("folder", folder);
              formData.append("file", file);

              const response = await fetch("/api/admin/upload-image", {
                method: "POST",
                body: formData
              });

              const data = (await response.json()) as { ok?: boolean; url?: string; error?: string };

              if (!response.ok || !data.ok || !data.url) {
                throw new Error(data.error || "图片上传失败。");
              }

              onChange(data.url);
            } catch (uploadError) {
              setError(uploadError instanceof Error ? uploadError.message : "图片上传失败。");
            } finally {
              setIsUploading(false);
              event.target.value = "";
            }
          }}
        />
        {error ? <p className="admin-copy" style={{ color: "#ff8fcb" }}>{error}</p> : null}
        {value ? (
          <div className="image-preview" style={{ minHeight: previewHeight }}>
            <img src={value} alt={label} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
