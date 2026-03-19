'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, FileText, Heading, Text } from 'lucide-react';
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { SearchEntry } from '@/app/api/search-index/route';

type SearchField = 'all' | 'title' | 'content';

interface SearchResult {
  entry: SearchEntry;
  field: string;
}

// FlexSearch Document를 동적으로 사용
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- FlexSearch Document 클래스의 타입 정의가 불완전
let Document: any = null;

async function getFlexSearch() {
  if (!Document) {
    const mod = await import('flexsearch');
    Document = mod.Document;
  }
  return Document;
}

function highlightMatch(text: string, query: string, maxLen: number = 120): string {
  if (!query || !text) return text.slice(0, maxLen);

  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);

  if (idx === -1) return text.slice(0, maxLen);

  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 80);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet = snippet + '…';

  return snippet;
}

const fieldLabels: Record<SearchField, string> = {
  all: '전체',
  title: '제목',
  content: '내용',
};

const fieldIcons: Record<string, React.ReactNode> = {
  all: <SearchIcon className="h-3.5 w-3.5" />,
  title: <Heading className="h-3.5 w-3.5" />,
  content: <Text className="h-3.5 w-3.5" />,
  description: <Text className="h-3.5 w-3.5" />,
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [field, setField] = useState<SearchField>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- FlexSearch Document 인스턴스 타입 미제공
  const indexRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultListRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 인덱스 로드
  useEffect(() => {
    if (!open || entries.length > 0) return;

    fetch('/api/search-index')
      .then((r) => r.json())
      .then(async (data: SearchEntry[]) => {
        setEntries(data);

        const DocClass = await getFlexSearch();
        const index = new DocClass({
          document: {
            id: 'id',
            index: ['title', 'content', 'description'],
            store: true,
          },
          tokenize: 'forward',
          charset: 'latin',
        });

        for (const entry of data) {
          index.add(entry);
        }

        indexRef.current = index;
      })
      .catch(console.error);
  }, [open, entries.length]);

  // 검색 실행
  useEffect(() => {
    if (!indexRef.current || !query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchFields = field === 'all'
      ? ['title', 'content', 'description']
      : field === 'content'
        ? ['content', 'description']
        : [field];

    const raw = indexRef.current.search(query, {
      limit: 20,
      index: searchFields,
      enrich: true,
    });

    // 중복 제거 + 결과 병합
    const seen = new Set<number>();
    const merged: SearchResult[] = [];

    for (const fieldResult of raw) {
      for (const item of fieldResult.result) {
        const doc = item.doc as SearchEntry;
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          merged.push({ entry: doc, field: fieldResult.field });
        }
      }
    }

    setResults(merged);
    setSelectedIndex(0);
  }, [query, field]);

  // 키보드 단축키: ⌘K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 선택 항목이 바뀌면 스크롤 추적
  useEffect(() => {
    const list = resultListRef.current;
    if (!list) return;
    const selected = list.children[selectedIndex] as HTMLElement | undefined;
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const navigate = useCallback((slug: string) => {
    setOpen(false);
    setQuery('');
    router.push(slug);
  }, [router]);

  // 결과 내 키보드 네비게이션
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].entry.slug);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline">검색</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className="fixed top-[10%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] rounded-lg border bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 duration-200 sm:max-w-[640px]"
          >
            <VisuallyHidden>
              <DialogTitle>검색</DialogTitle>
            </VisuallyHidden>

            {/* 검색 입력 영역 */}
            <div className="flex items-center border-b px-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="검색어를 입력하세요…"
                className="flex h-11 w-full rounded-md bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />

              {/* 필드 선택 드롭다운 */}
              <select
                value={field}
                onChange={(e) => setField(e.target.value as SearchField)}
                className="h-7 rounded border bg-muted px-2 text-xs text-muted-foreground outline-none cursor-pointer shrink-0"
              >
                {(Object.keys(fieldLabels) as SearchField[]).map((f) => (
                  <option key={f} value={f}>{fieldLabels[f]}</option>
                ))}
              </select>
            </div>

            {/* 검색 결과 */}
            <div ref={resultListRef} className="max-h-[min(400px,60vh)] overflow-y-auto">
              {query && results.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  검색 결과가 없습니다
                </div>
              )}

              {!query && entries.length > 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {entries.length}개의 문서에서 검색합니다
                </div>
              )}

              {!query && entries.length === 0 && open && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  인덱스 로딩 중…
                </div>
              )}

              {results.map((result, i) => (
                <button
                  key={result.entry.id}
                  onClick={() => navigate(result.entry.slug)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                    i === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <FileText className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {result.entry.title}
                    </div>
                    {result.entry.description && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {result.entry.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      {result.field === 'content' || result.field === 'description' ? (
                        <span>{highlightMatch(result.entry.content, query)}</span>
                      ) : (
                        <span>{result.entry.slug}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    {fieldIcons[result.field] || fieldIcons.all}
                    <span className="text-[10px] text-muted-foreground">
                      {result.field}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* 하단 힌트 */}
            <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <span><kbd className="rounded border px-1">↑↓</kbd> 이동</span>
                <span><kbd className="rounded border px-1">↵</kbd> 열기</span>
                <span><kbd className="rounded border px-1">esc</kbd> 닫기</span>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}
