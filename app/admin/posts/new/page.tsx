import { EditorShell } from "@/components/admin/editor-shell";
import { MarkdownImportForm } from "@/components/admin/markdown-import-form";
import { requireAdmin } from "@/lib/auth/admin";
import { getTopicOptions } from "@/lib/content/repository";

export const metadata = {
  title: "新建文章"
};

type NewPostPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const topics = await getTopicOptions();

  return (
    <div className="stack">
      <div>
        <span className="admin-caption">Create</span>
        <h1 className="admin-heading">新建文章</h1>
      </div>
      <section className="admin-card stack">
        <span className="admin-caption">Markdown Import</span>
        <p className="admin-copy">支持直接粘贴 Markdown 文本，或上传 `.md` 文件创建文章。即使 frontmatter 不完整，也会自动从标题和正文推导基础字段。</p>
        <MarkdownImportForm topics={topics} initialError={params.error} />
      </section>
      <EditorShell topics={topics} />
    </div>
  );
}
