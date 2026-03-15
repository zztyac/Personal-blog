import { ArchiveBrowser } from "@/components/site/archive-browser";
import { SectionTitle } from "@/components/site/section-title";
import { getPublishedPosts, getTagSummary } from "@/lib/content/repository";

export const metadata = {
  title: "文章档案"
};

export default async function ArchivePage() {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getTagSummary()]);

  return (
    <div className="shell">
      <section className="archive-banner">
        <div className="archive-banner__panel stack">
          <span className="hero__eyebrow">Archive</span>
          <h1 className="section-title__heading">全部文章</h1>
          <p className="section-copy">按发布时间倒序浏览文章，后续这里可以扩展为全文搜索、标签过滤和年份归档。</p>
        </div>
      </section>
      <section className="section">
        <SectionTitle
          eyebrow="All Posts"
          title={`${posts.length} 篇文章`}
          copy="支持按标题、摘要和标签搜索，也可以通过标签快速筛选专题内容。"
        />
        <ArchiveBrowser posts={posts} tags={tags} />
      </section>
    </div>
  );
}
