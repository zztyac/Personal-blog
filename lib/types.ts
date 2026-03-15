export type PostStatus = "draft" | "published" | "archived";

export type TopicRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  accentColor: string;
  coverImage?: string;
  postCount: number;
};

export type PostRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage?: string;
  topicSlug: string;
  topicName: string;
  accentColor: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  isFeatured: boolean;
  status: PostStatus;
  contentMarkdown: string;
};
