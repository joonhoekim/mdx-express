"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { formatTitle } from "@/lib/utils";
import type { RecentArticle } from "@/lib/recent-articles";

const BATCH = 20;

function formatDate(date: string): string {
  return date ? date.replace(/-/g, ".") : "";
}

interface RecentArticlesListProps {
  articles: RecentArticle[];
}

/**
 * 최신 글 목록을 BATCH 단위로 점진 노출(무한 스크롤).
 * 전체 목록은 props로 받고, 하단 sentinel이 뷰포트 근처에 들어오면 다음 묶음을 드러낸다.
 * 서버 라운드트립 없음 — 데이터셋이 작아 전체를 한 번에 들고 슬라이스만 늘린다.
 */
export function RecentArticlesList({ articles }: RecentArticlesListProps) {
  const [count, setCount] = useState(() => Math.min(BATCH, articles.length));
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = count < articles.length;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    // count를 deps에 포함 → 한 묶음을 드러낸 뒤에도 sentinel이 여전히 보이면
    // 옵저버가 재생성되며 즉시 다음 묶음을 채운다(짧은 묶음으로 화면이 안 차는 경우 대비).
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCount((c) => Math.min(c + BATCH, articles.length));
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, count, articles.length]);

  return (
    <>
      <ul className="divide-y divide-border">
        {articles.slice(0, count).map((article) => (
          <li key={article.href}>
            <Link
              href={article.href}
              className="group flex flex-col gap-1 py-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-1">
                  {article.crumbs.map((crumb, i) => {
                    const isLast = i === article.crumbs.length - 1;
                    return (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="h-3 w-3 opacity-40" />}
                        <span className={isLast ? "font-medium text-foreground/70" : undefined}>
                          {formatTitle(crumb)}
                        </span>
                      </span>
                    );
                  })}
                </div>
                {article.updated && (
                  <time dateTime={article.updated} className="shrink-0 tabular-nums">
                    {formatDate(article.updated)}
                  </time>
                )}
              </div>

              <h2 className="flex items-center gap-1 text-lg font-semibold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {article.title}
                <ArrowUpRight className="h-4 w-4 shrink-0 -translate-y-0.5 opacity-0 transition group-hover:opacity-60" />
              </h2>

              {article.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {article.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {hasMore && <div ref={sentinelRef} aria-hidden className="h-8" />}
    </>
  );
}
