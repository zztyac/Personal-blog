"use client";

import { useEffect, useMemo, useState } from "react";
import { PostCard } from "@/components/site/post-card";
import type { PostRecord } from "@/lib/types";

type TagSummary = {
  tag: string;
  count: number;
};

type ArchiveBrowserProps = {
  posts: PostRecord[];
  tags: TagSummary[];
};

export function ArchiveBrowser({ posts, tags }: ArchiveBrowserProps) {
  const pageSize = 6;
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesQuery =
        !normalizedQuery ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.summary.toLowerCase().includes(normalizedQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      const matchesTag = !activeTag || post.tags.includes(activeTag);

      return matchesQuery && matchesTag;
    });
  }, [activeTag, posts, query]);

  useEffect(() => {
    setPage(1);
  }, [activeTag, query]);

  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const currentPosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const groupedPosts = currentPosts.reduce<Record<string, PostRecord[]>>((groups, post) => {
    const year = new Date(post.publishedAt).getFullYear().toString();
    groups[year] ||= [];
    groups[year].push(post);
    return groups;
  }, {});

  return (
    <div className="stack">
      <section className="panel stack">
        <div className="field">
          <label htmlFor="archive-search">搜索文章</label>
          <input
            id="archive-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、摘要或标签"
          />
        </div>
        <div className="archive-filter__header">
          <span className="admin-caption">Tags</span>
          {activeTag ? (
            <button type="button" className="button-secondary" onClick={() => setActiveTag("")}>
              清除标签过滤
            </button>
          ) : null}
        </div>
        <div className="pill-list">
          {tags.map((item) => (
            <button
              key={item.tag}
              type="button"
              className={`pill archive-tag${activeTag === item.tag ? " archive-tag--active" : ""}`}
              onClick={() => setActiveTag((current) => (current === item.tag ? "" : item.tag))}
            >
              #{item.tag} ({item.count})
            </button>
          ))}
        </div>
      </section>

      <div className="eyebrow-row">
        <span className="admin-caption">Results</span>
        <span className="muted">
          {filteredPosts.length} 篇匹配文章 / 第 {currentPage} 页，共 {pageCount} 页
        </span>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="panel">
          <p className="admin-copy">没有匹配到文章。你可以修改关键词，或者清除标签筛选后再试。</p>
        </div>
      ) : (
        <div className="stack">
          {Object.entries(groupedPosts).map(([year, yearPosts]) => (
            <section key={year} className="stack">
              <div className="archive-year">
                <span className="section-title__eyebrow">Year</span>
                <h3 className="section-title__heading">{year}</h3>
              </div>
              <div className="grid grid--posts">
                {yearPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          ))}

          {pageCount > 1 ? (
            <div className="editor-actions">
              <button type="button" className="button-secondary table-action" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                上一页
              </button>
              <button type="button" className="button-secondary table-action" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                下一页
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
