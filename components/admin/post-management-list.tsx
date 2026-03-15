"use client";

import Link from "next/link";
import { useState } from "react";
import { deletePostAction } from "@/app/admin/actions";
import { formatDisplayDate } from "@/lib/format";
import type { PostRecord } from "@/lib/types";

type PostManagementListProps = {
  posts: PostRecord[];
  deleted?: boolean;
};

function PostStatusBadge({ status }: { status: PostRecord["status"] }) {
  return <span className={`status-badge status-badge--${status}`}>{status.toUpperCase()}</span>;
}

export function PostManagementList({ posts, deleted }: PostManagementListProps) {
  const [pendingDelete, setPendingDelete] = useState<PostRecord | null>(null);

  return (
    <section className="admin-card stack">
      {deleted ? <p className="admin-copy" style={{ color: "#8fffd4" }}>文章已删除。</p> : null}
      <div className="mini-list">
        {posts.map((post) => (
          <div key={post.id} className="mini-list__item admin-row">
            <div className="stack">
              <strong>{post.title}</strong>
              <div className="post-meta">
                <PostStatusBadge status={post.status} />
                <span className="pill">#{post.topicName}</span>
                <span className="muted">{formatDisplayDate(post.publishedAt)}</span>
              </div>
            </div>
            <div className="row-actions">
              <Link href={`/admin/posts/${encodeURIComponent(post.slug)}/edit`} className="button-secondary table-action">
                编辑文章
              </Link>
              <button type="button" className="button-secondary danger-button table-action" onClick={() => setPendingDelete(post)}>
                删除文章
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingDelete ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-post-title">
          <div className="modal-card stack">
            <span className="admin-caption">Confirm Delete</span>
            <h2 id="delete-post-title" className="admin-heading">
              删除文章
            </h2>
            <p className="admin-copy">
              你将删除《{pendingDelete.title}》。这个操作会移除对应的 Markdown 文件，且无法自动恢复。
            </p>
            <div className="editor-actions">
              <button type="button" className="button-secondary table-action" onClick={() => setPendingDelete(null)}>
                取消
              </button>
              <form action={deletePostAction}>
                <input type="hidden" name="slug" value={pendingDelete.slug} />
                <button type="submit" className="button-secondary danger-button table-action">
                  确认删除
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
