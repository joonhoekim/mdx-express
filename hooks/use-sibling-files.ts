"use client";

import { useState, useEffect, useMemo } from "react";
import { NavigationItem } from "@/lib/navigation";

interface UseSiblingFilesResult {
  dynamicItems: NavigationItem[];
  isLoading: boolean;
  error: Error | null;
}

// 중복된 API 호출을 방지하기 위한 캐시
const cache = new Map<string, { data: NavigationItem[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export function useSiblingFiles(pathname: string): UseSiblingFilesResult {
  const [dynamicItems, setDynamicItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSiblingFiles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 캐시 확인
        const cached = cache.get(pathname);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp < CACHE_DURATION)) {
          setDynamicItems(cached.data);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/sibling-files?pathname=${encodeURIComponent(pathname)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sibling files');
        }

        const data = await response.json();
        const files = data.files || [];
        
        // 캐시에 저장
        cache.set(pathname, { data: files, timestamp: now });
        
        setDynamicItems(files);
      } catch (err) {
        console.error('Error fetching sibling files:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiblingFiles();
  }, [pathname]);

  // 메모이제이션으로 불필요한 재렌더링 방지
  return useMemo(() => ({
    dynamicItems,
    isLoading,
    error
  }), [dynamicItems, isLoading, error]);
}
