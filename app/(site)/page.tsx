import Link from "next/link";
import { PostCard } from "@/components/site/post-card";
import { SectionTitle } from "@/components/site/section-title";
import { TopicCard } from "@/components/site/topic-card";
import { getFeaturedPosts, getTopics } from "@/lib/content/repository";

export default async function HomePage() {
  const [topics, featuredPosts] = await Promise.all([getTopics(), getFeaturedPosts()]);

  return (
    <div className="shell">
      <section className="hero">
        <div className="hero__panel stack">
          <span className="hero__eyebrow">Signal Online / 2026</span>
          <h1 className="hero__title">Build. Decode. Broadcast.</h1>
          <p className="hero__summary">
            一个带有赛博朋克视觉语言的个人技术博客，面向长期内容沉淀。文章支持 Markdown 导入，
            以专题组织，并保留后台在线编辑能力。
          </p>
          <div className="hero__actions">
            <Link href="/archive" className="button-primary">
              浏览文章
            </Link>
            <Link href="/admin/posts/new" className="button-secondary">
              进入编辑器
            </Link>
          </div>
          <div className="pill-list">
            <span className="pill">Markdown-first</span>
            <span className="pill">Topic-native</span>
            <span className="pill">Editor-ready</span>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionTitle
          eyebrow="Topics"
          title="专题矩阵"
          copy="每个专题都是独立入口。你可以将博客内容按技术域、项目复盘、实验记录等维度组织，并保留稳定的分享链接。"
        />
        <div className="grid grid--topics">
          {topics.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionTitle
          eyebrow="Featured Posts"
          title="精选文章"
          copy="当前骨架已具备文章卡片、标签、专题联动与独立文章页结构。后续只需要将数据源切换到 Prisma + PostgreSQL。"
        />
        <div className="grid grid--posts">
          {featuredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
