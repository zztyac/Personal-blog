---
title: "Building a Topic-Driven Blog"
slug: "building-a-topic-driven-blog"
summary: "如何把博客从简单文章列表升级为专题驱动的信息架构。"
topic: "shipping-notes"
tags:
  - blog
  - information-architecture
publishedAt: "2026-03-15T08:00:00.000Z"
status: "draft"
featured: false
---

## Why topic-first matters

If every post is just another entry in a flat list, the site will scale poorly.

- Topics create stronger entry points
- Articles become easier to share
- Readers can browse by domain instead of only by time

```ts
export const routing = "/topics/[topicSlug]";
```
