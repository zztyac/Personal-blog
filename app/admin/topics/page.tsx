import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { TopicManagementPanel } from "@/components/admin/topic-management-panel";
import { getTopics } from "@/lib/content/repository";

export const metadata = {
  title: "专题管理"
};

type AdminTopicsPageProps = {
  searchParams: Promise<{
    error?: string;
    created?: string;
    updated?: string;
    deleted?: string;
  }>;
};

export default async function AdminTopicsPage({ searchParams }: AdminTopicsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const topics = await getTopics();

  return (
    <div className="stack">
      <div className="eyebrow-row">
        <div>
          <span className="admin-caption">Topics</span>
          <h1 className="admin-heading">专题管理</h1>
        </div>
        <Link href="/" className="button-secondary">
          返回前台
        </Link>
      </div>
      <TopicManagementPanel
        topics={topics}
        error={params.error}
        created={Boolean(params.created)}
        updated={Boolean(params.updated)}
        deleted={Boolean(params.deleted)}
      />
    </div>
  );
}
