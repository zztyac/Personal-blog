import Link from "next/link";
import type { TopicRecord } from "@/lib/types";

export function TopicCard({ topic }: { topic: TopicRecord }) {
  return (
    <Link href={`/topics/${topic.slug}`} className="topic-card stack">
      {topic.coverImage ? (
        <div className="card-cover">
          <img src={topic.coverImage} alt={topic.name} />
        </div>
      ) : null}
      <span className="topic-card__accent" style={{ color: topic.accentColor, background: topic.accentColor }} />
      <span className="hero__eyebrow">Topic / {topic.postCount} Posts</span>
      <h3 className="topic-card__title">{topic.name}</h3>
      <p className="topic-card__description">{topic.description}</p>
    </Link>
  );
}
