import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdjacentArticles } from '@/lib/mdx-utils';

interface ArticleNavigationProps {
    adjacent: AdjacentArticles;
}

export function ArticleNavigation({ adjacent }: ArticleNavigationProps) {
    const { prev, next } = adjacent;

    if (!prev && !next) return null;

    return (
        <nav className="mt-12 grid grid-cols-2 gap-3 border-t pt-6">
            {prev ? (
                <Link
                    href={prev.href}
                    className="group flex items-center gap-2 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/50"
                >
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">이전 글</p>
                        <p className="text-sm font-medium truncate">{prev.title}</p>
                    </div>
                </Link>
            ) : (
                <div />
            )}

            {next ? (
                <Link
                    href={next.href}
                    className="group flex items-center justify-end gap-2 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/50 text-right"
                >
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">다음 글</p>
                        <p className="text-sm font-medium truncate">{next.title}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
            ) : (
                <div />
            )}
        </nav>
    );
}
