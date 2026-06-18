import Link from 'next/link';
import { ArrowUpRight, BookOpen, ChevronRight } from 'lucide-react';
import { getRecentArticles } from '@/lib/recent-articles';
import { formatTitle } from '@/lib/utils';

function formatDate(date: string): string {
  return date ? date.replace(/-/g, '.') : '';
}

export default async function DocsIndexPage() {
  const articles = await getRecentArticles(30);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">최신 글</h1>
        <p className="text-muted-foreground">
          최근에 쓰거나 고친 글부터 모아봤어요. 카테고리 탐색은 왼쪽 사이드바를 이용하세요.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">글이 없습니다</h3>
          <p className="text-muted-foreground">
            content 폴더에 MDX 파일을 추가하면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {articles.map((article) => (
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
                          <span className={isLast ? 'font-medium text-foreground/70' : undefined}>
                            {formatTitle(crumb)}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  {article.updated && (
                    <time
                      dateTime={article.updated}
                      className="shrink-0 tabular-nums"
                    >
                      {formatDate(article.updated)}
                    </time>
                  )}
                </div>

                <h2 className="flex items-center gap-1 text-lg font-semibold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {article.title}
                  <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 -translate-y-0.5 transition group-hover:opacity-60" />
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
      )}
    </div>
  );
}
