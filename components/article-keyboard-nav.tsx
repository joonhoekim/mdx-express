"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AdjacentArticle } from "@/lib/mdx-utils";

interface ArticleKeyboardNavProps {
  prev: AdjacentArticle | null;
  next: AdjacentArticle | null;
}

/**
 * ←/→ 방향키로 이전/다음 글 이동. UI는 렌더하지 않는다.
 * 입력 포커스·수정자 키·방향키를 자체 처리하는 위젯(radix Tabs 등)에서는 양보한다.
 */
export function ArticleKeyboardNav({ prev, next }: ArticleKeyboardNavProps) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) ||
          t.closest('[role="tablist"]'))
      )
        return;

      if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        router.push(next.href);
      } else if (e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        router.push(prev.href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  return null;
}
