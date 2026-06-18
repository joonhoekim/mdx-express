"use client";

import { useMemo, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActiveHeading } from '@/hooks/use-active-heading';
import type { TocHeading } from '@/components/mdx-options';

interface TableOfContentsProps {
  headings: TocHeading[];
  className?: string;
}

/**
 * 우측 목차(TOC). h2~h3 헤딩 바로가기 + 스크롤스파이 활성 표시.
 * 표시 위치/반응형 노출은 DocumentPage의 래퍼가 담당한다.
 * 헤딩이 2개 미만이면 렌더하지 않는다.
 */
export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeId = useActiveHeading(ids);

  if (headings.length < 2) return null;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav
      aria-label="목차"
      className={cn('sticky top-24 w-56', className)}
    >
      {/* 높이 = 뷰포트 - 상단 크롬(상단바 4rem + 브레드크럼 ~2rem) - sticky 오프셋(top-24=6rem) - 하단 여백.
          이 값을 키우면 ScrollArea 하단이 화면 밖으로 나가 마지막 항목에 닿지 못한다. */}
      <ScrollArea className="h-[calc(100dvh-14rem)]">
        <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          목차
        </p>
        <ul className="space-y-1 border-l border-slate-200 dark:border-slate-700 pr-3">
          {headings.map((h) => {
            const isActive = h.id === activeId;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => handleClick(e, h.id)}
                  className={cn(
                    '-ml-px block border-l-2 py-1 text-sm transition-colors',
                    h.depth === 3 ? 'pl-6' : 'pl-4',
                    isActive
                      ? 'border-blue-500 font-medium text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                  )}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </nav>
  );
}
