import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/site/post-card";
import { getPostsByTopicSlug, getTopicBySlug, getTopics } from "@/lib/content/repository";

type TopicPageProps = {
  params: Promise<{
    topicSlug: string;
  }>;
};

export async function generateStaticParams() {
  const topics = await getTopics();
  return topics.map((topic) => ({ topicSlug: topic.slug }));
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { topicSlug } = await params;
  const topic = await getTopicBySlug(topicSlug);

  if (!topic) {
    return { title: "专题不存在" };
  }

  return {
    title: topic.name,
    description: topic.description,
    openGraph: topic.coverImage
      ? {
          images: [topic.coverImage]
        }
      : undefined
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topicSlug } = await params;
  const topic = await getTopicBySlug(topicSlug);

  if (!topic) {
    notFound();
  }

  const posts = await getPostsByTopicSlug(topic.slug);

  return (
    <div className="shell">
      <section className="topic-banner">
        <div className="topic-banner__panel stack">
          <span className="hero__eyebrow">Topic</span>
          <h1 className="section-title__heading">{topic.name}</h1>
          {topic.coverImage ? (
            <div className="article-cover">
              <img src={topic.coverImage} alt={topic.name} />
            </div>
          ) : null}
          <p className="section-copy">{topic.description}</p>
          <div className="pill-list">
            <span className="pill">{posts.length} 篇文章</span>
            <span className="pill">Accent {topic.accentColor}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid grid--posts">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
