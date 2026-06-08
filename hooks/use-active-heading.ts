"use client";

import { useEffect, useState } from 'react';

/**
 * 현재 뷰포트 상단에 가장 가까운 헤딩 id를 추적한다 (스크롤스파이).
 * IntersectionObserver로 화면에 보이는 헤딩들을 모으고, 그중 문서 순서상
 * 가장 위에 있는 것을 활성으로 본다. 아무것도 안 보이면 마지막 활성값 유지.
 */
export function useActiveHeading(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // 문서 순서(ids) 기준 가장 위에 보이는 헤딩을 활성으로
        const firstVisible = ids.find((id) => visible.has(id));
        if (firstVisible) setActiveId(firstVisible);
      },
      // 상단 고정 헤더(약 96px) 아래를 기준선으로 삼아 일찍 활성화
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
