"use client";

import Link from "next/link";
import { useState } from "react";
import { createTopicAction, deleteTopicAction, updateTopicAction } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { TopicRecord } from "@/lib/types";

type TopicManagementPanelProps = {
  topics: TopicRecord[];
  error?: string;
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
};

function ColorField({
  id,
  name,
  initialColor
}: {
  id: string;
  name: string;
  initialColor: string;
}) {
  const [color, setColor] = useState(initialColor);

  return (
    <div className="field">
      <label htmlFor={id}>主题色</label>
      <div className="color-field">
        <input
          id={id}
          name={name}
          value={color}
          onChange={(event) => setColor(event.target.value)}
          placeholder="#00f6ff"
        />
        <input
          type="color"
          value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : "#00f6ff"}
          onChange={(event) => setColor(event.target.value)}
          aria-label="选择主题色"
        />
        <span className="color-swatch" style={{ background: color }} aria-hidden="true" />
      </div>
    </div>
  );
}

function TopicEditorItem({ topic }: { topic: TopicRecord }) {
  const [coverImage, setCoverImage] = useState(topic.coverImage || "");

  return (
    <details className="topic-item">
      <summary className="topic-item__summary">
        <div className="topic-item__identity">
          <span className="color-swatch" style={{ background: topic.accentColor }} aria-hidden="true" />
          <div className="stack" style={{ gap: 8 }}>
            <strong>{topic.name}</strong>
            <div className="post-meta">
              <span className="pill">{topic.slug}</span>
              <span className="muted">{topic.postCount} 篇文章</span>
            </div>
          </div>
        </div>
        <span className="muted topic-item__hint">展开编辑</span>
      </summary>

      <div className="topic-item__body stack">
        <p className="admin-copy">{topic.description}</p>
        <form action={updateTopicAction} className="topic-form-grid">
          <input type="hidden" name="previousSlug" value={topic.slug} />
          <input type="hidden" name="coverImage" value={coverImage} />
          <div className="field">
            <label htmlFor={`name-${topic.slug}`}>专题名称</label>
            <input id={`name-${topic.slug}`} name="name" defaultValue={topic.name} />
          </div>
          <div className="field">
            <label htmlFor={`slug-${topic.slug}`}>Slug</label>
            <input id={`slug-${topic.slug}`} name="slug" defaultValue={topic.slug} />
          </div>
          <div className="field topic-form-grid__full">
            <label htmlFor={`description-${topic.slug}`}>描述</label>
            <textarea id={`description-${topic.slug}`} name="description" defaultValue={topic.description} style={{ minHeight: 120 }} />
          </div>
          <ColorField id={`accent-${topic.slug}`} name="accentColor" initialColor={topic.accentColor} />
          <div className="topic-form-grid__full">
            <ImageUploadField label="专题封面" folder="topic-covers" value={coverImage} onChange={setCoverImage} previewHeight={160} />
          </div>
          <div className="editor-actions topic-form-grid__full">
            <button type="submit" className="button-primary table-action">
              更新专题
            </button>
            <Link href={`/topics/${topic.slug}`} className="button-secondary table-action">
              查看专题
            </Link>
          </div>
        </form>

        <form action={deleteTopicAction}>
          <input type="hidden" name="slug" value={topic.slug} />
          <button type="submit" className="button-secondary danger-button table-action">
            删除专题
          </button>
        </form>
      </div>
    </details>
  );
}

export function TopicManagementPanel({ topics, error, created, updated, deleted }: TopicManagementPanelProps) {
  const [newCoverImage, setNewCoverImage] = useState("");

  return (
    <div className="stack">
      <section className="admin-card stack">
        <span className="admin-caption">Create Topic</span>
        <p className="admin-copy">专题页改为折叠式维护结构，专题很多时仍然可以快速浏览和定位。</p>
        {error ? <p className="admin-copy" style={{ color: "#ff8fcb" }}>{error}</p> : null}
        {created ? <p className="admin-copy" style={{ color: "#8fffd4" }}>专题已创建。</p> : null}
        {updated ? <p className="admin-copy" style={{ color: "#8fffd4" }}>专题已更新。</p> : null}
        {deleted ? <p className="admin-copy" style={{ color: "#8fffd4" }}>专题已删除。</p> : null}

        <form action={createTopicAction} className="topic-form-grid">
          <input type="hidden" name="coverImage" value={newCoverImage} />
          <div className="field">
            <label htmlFor="name">专题名称</label>
            <input id="name" name="name" placeholder="Cloud Notes" />
          </div>
          <div className="field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" placeholder="cloud-notes" />
          </div>
          <div className="field topic-form-grid__full">
            <label htmlFor="description">专题描述</label>
            <textarea id="description" name="description" style={{ minHeight: 120 }} />
          </div>
          <ColorField id="accentColor" name="accentColor" initialColor="#00f6ff" />
          <div className="topic-form-grid__full">
            <ImageUploadField label="专题封面" folder="topic-covers" value={newCoverImage} onChange={setNewCoverImage} previewHeight={160} />
          </div>
          <div className="editor-actions topic-form-grid__full">
            <button type="submit" className="button-primary table-action">
              创建专题
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card stack">
        <div className="eyebrow-row">
          <span className="admin-caption">Topic Directory</span>
          <span className="muted">{topics.length} 个专题</span>
        </div>
        <div className="stack">
          {topics.map((topic) => (
            <TopicEditorItem key={topic.slug} topic={topic} />
          ))}
        </div>
      </section>
    </div>
  );
}
