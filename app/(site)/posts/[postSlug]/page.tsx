import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownContent } from "@/components/site/markdown-content";
import { PostCard } from "@/components/site/post-card";
import { formatDisplayDate } from "@/lib/format";
import { getPostBySlug, getPublishedPosts, getRelatedPosts, getTopicBySlug } from "@/lib/content/repository";

type PostPageProps = {
  params: Promise<{
    postSlug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ postSlug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { postSlug } = await params;
  const post = await getPostBySlug(postSlug);

  if (!post) {
    return { title: "文章不存在" };
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: post.coverImage
      ? {
          images: [post.coverImage]
        }
      : undefined
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { postSlug } = await params;
  const post = await getPostBySlug(postSlug);

  if (!post) {
    notFound();
  }

  const [topic, relatedPosts] = await Promise.all([
    getTopicBySlug(post.topicSlug),
    getRelatedPosts(post.slug, post.topicSlug)
  ]);

  return (
    <div className="shell">
      <div className="article-layout">
        <article className="article-shell stack">
          <div className="stack">
            <span className="article-meta__label">Transmission</span>
            <h1 className="article-title">{post.title}</h1>
            <div className="article-meta">
              <span>{formatDisplayDate(post.publishedAt)}</span>
              <span>{post.readingTime} min read</span>
              {topic ? <Link href={`/topics/${topic.slug}`}>{topic.name}</Link> : null}
            </div>
            {post.coverImage ? (
              <div className="article-cover">
                <img src={post.coverImage} alt={post.title} />
              </div>
            ) : null}
            <p className="lede">{post.summary}</p>
            <div className="article-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="pill">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="article-body">
            <MarkdownContent source={post.contentMarkdown} />
          </div>
        </article>

        <aside className="article-side">
          <div className="panel stack">
            <span className="admin-caption">Share Link</span>
            <span className="muted">/posts/{post.slug}</span>
          </div>

          <div className="panel stack">
            <span className="admin-caption">Related</span>
            {relatedPosts.length === 0 ? (
              <span className="muted">当前专题下暂无更多文章</span>
            ) : (
              relatedPosts.map((related) => (
                <Link key={related.slug} href={`/posts/${encodeURIComponent(related.slug)}`} className="post-meta">
                  <span>{related.title}</span>
                  <span>{formatDisplayDate(related.publishedAt)}</span>
                </Link>
              ))
            )}
          </div>
        </aside>
      </div>

      {relatedPosts.length > 0 ? (
        <section className="section">
          <div className="grid grid--posts">
            {relatedPosts.map((related) => (
              <PostCard key={related.slug} post={related} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
