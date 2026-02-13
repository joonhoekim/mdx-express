"use client";

import { useState, useEffect } from "react";
import { NavigationItem } from "@/lib/navigation";

interface UseSiblingFilesResult {
  dynamicItems: NavigationItem[];
  isLoading: boolean;
  error: Error | null;
}

// 중복된 API 호출을 방지하기 위한 캐시 (크기 제한 포함)
const cache = new Map<string, { data: NavigationItem[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const MAX_CACHE_SIZE = 50;

function setCache(key: string, data: NavigationItem[]): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    // 가장 오래된 항목 삭제
    const firstKey = cache.keys().next().value;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }
  cache.set(key, { data, timestamp: Date.now() });
}

export function useSiblingFiles(pathname: string): UseSiblingFilesResult {
  const [dynamicItems, setDynamicItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSiblingFiles = async () => {
      try {
        setError(null);

        // 캐시 확인
        const cached = cache.get(pathname);
        const now = Date.now();

        if (cached && (now - cached.timestamp < CACHE_DURATION)) {
          setDynamicItems(cached.data);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        const response = await fetch(`/api/sibling-files?pathname=${encodeURIComponent(pathname)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sibling files');
        }

        const data = await response.json();
        const files = data.files || [];

        // 캐시에 저장 (크기 제한 적용)
        setCache(pathname, files);

        setDynamicItems(files);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[useSiblingFiles] ${message}`);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiblingFiles();
  }, [pathname]);

  return {
    dynamicItems,
    isLoading,
    error
  };
}
