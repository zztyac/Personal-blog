import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { HistoryControls } from "@/components/admin/history-controls";
import { PostManagementList } from "@/components/admin/post-management-list";
import { getAllPosts } from "@/lib/content/repository";

export const metadata = {
  title: "文章管理"
};

type AdminPostsPageProps = {
  searchParams: Promise<{
    deleted?: string;
  }>;
};

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const posts = await getAllPosts();

  return (
    <div className="stack">
      <div className="eyebrow-row">
        <div className="stack" style={{ gap: 12 }}>
          <span className="admin-caption">Posts</span>
          <h1 className="admin-heading">文章管理</h1>
          <HistoryControls />
        </div>
        <Link href="/admin/posts/new" className="button-primary">
          新建文章
        </Link>
      </div>
      <PostManagementList posts={posts} deleted={Boolean(params.deleted)} />
    </div>
  );
}
