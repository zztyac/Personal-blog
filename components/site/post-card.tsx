import Link from "next/link";
import { formatDisplayDate } from "@/lib/format";
import type { PostRecord } from "@/lib/types";

export function PostCard({ post }: { post: PostRecord }) {
  return (
    <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="post-card stack">
      {post.coverImage ? (
        <div className="card-cover">
          <img src={post.coverImage} alt={post.title} />
        </div>
      ) : null}
      <span className="post-card__accent" style={{ color: post.accentColor, background: post.accentColor }} />
      <div className="post-meta">
        <span>{post.topicName}</span>
        <span>{formatDisplayDate(post.publishedAt)}</span>
      </div>
      <h3 className="post-card__title">{post.title}</h3>
      <p className="post-card__summary">{post.summary}</p>
      <div className="pill-list">
        {post.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="pill">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
