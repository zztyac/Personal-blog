import Link from "next/link";
import { formatDisplayDate } from "@/lib/format";
import { requireAdmin } from "@/lib/auth/admin";
import { getDashboardMetrics, getPublishedPosts, getTopics } from "@/lib/content/repository";

export const metadata = {
  title: "后台"
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [metrics, posts, topics] = await Promise.all([
    getDashboardMetrics(),
    getPublishedPosts(),
    getTopics()
  ]);

  return (
    <div className="stack">
      <div className="eyebrow-row">
        <div>
          <span className="admin-caption">Admin Dashboard</span>
          <h1 className="admin-heading">内容控制台</h1>
        </div>
        <Link href="/admin/posts/new" className="button-primary">
          新建文章
        </Link>
      </div>

      <section className="metrics-grid">
        <div className="metric-card stack">
          <span className="admin-caption">Published</span>
          <strong>{metrics.publishedPosts}</strong>
          <span className="muted">已发布文章</span>
        </div>
        <div className="metric-card stack">
          <span className="admin-caption">Drafts</span>
          <strong>{metrics.draftPosts}</strong>
          <span className="muted">草稿数量</span>
        </div>
        <div className="metric-card stack">
          <span className="admin-caption">Topics</span>
          <strong>{topics.length}</strong>
          <span className="muted">专题数量</span>
        </div>
      </section>

      <section className="admin-card stack">
        <div className="eyebrow-row">
          <div>
            <span className="admin-caption">Recent Posts</span>
            <h2 className="admin-heading">最近文章</h2>
          </div>
          <Link href="/admin/posts" className="button-secondary">
            查看全部
          </Link>
        </div>
        <div className="mini-list">
          {posts.slice(0, 4).map((post) => (
            <div key={post.id} className="mini-list__item">
              <div className="stack">
                <strong>{post.title}</strong>
                <span className="muted">{post.summary}</span>
              </div>
              <div className="stack" style={{ textAlign: "right" }}>
                <span className="muted">{formatDisplayDate(post.publishedAt)}</span>
                <Link href={`/admin/posts/${encodeURIComponent(post.slug)}/edit`} className="muted">
                  编辑
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
