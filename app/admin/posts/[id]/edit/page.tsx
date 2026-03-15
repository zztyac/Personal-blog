import { notFound } from "next/navigation";
import { deletePostAction } from "@/app/admin/actions";
import { EditorShell } from "@/components/admin/editor-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { getPostById, getTopicOptions } from "@/lib/content/repository";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  await requireAdmin();
  const { id } = await params;
  const [post, topics] = await Promise.all([getPostById(id), getTopicOptions()]);

  if (!post) {
    notFound();
  }

  return (
    <div className="stack">
      <div>
        <span className="admin-caption">Editor</span>
        <h1 className="admin-heading">编辑文章</h1>
      </div>
      <div className="editor-header">
        <EditorShell post={post} topics={topics} />
        <form action={deletePostAction}>
          <input type="hidden" name="slug" value={post.slug} />
          <button type="submit" className="button-secondary danger-button">
            删除文章
          </button>
        </form>
      </div>
    </div>
  );
}
