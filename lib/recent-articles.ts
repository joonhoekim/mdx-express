import { spawnSync } from 'child_process';
import { unstable_cache } from 'next/cache';
import { getAllMDXNestedSections } from './mdx-tree';
import { buildDocsPath } from './build-docs-path';
import type { MDXFileNode } from './mdx-types';

// 콘텐츠는 배포 사이에 거의 안 변하므로 길게 캐시. dev에서는 짧게 둬 수정이 빨리 반영되게 한다.
const RECENT_REVALIDATE = process.env.NODE_ENV === 'development' ? 10 : 3600;

export interface RecentArticle {
  title: string;
  description?: string;
  href: string;
  crumbs: string[]; // 파일까지의 디렉토리 slug 경로 (예: ['dev','database','refactoring-database'])
  updated: string;  // YYYY-MM-DD ('' = git 이력 없음)
}

/**
 * content/ 전체에 대해 git log를 한 번만 실행해 파일별 최신 커밋 날짜를 수집한다.
 * (파일마다 git을 띄우는 getGitMetadata와 달리 단일 프로세스 — 인덱스 페이지에서 수백 개를 다룰 때 필요)
 * git을 쓸 수 없는 환경에서는 빈 맵을 반환하고, 정렬은 트리 순서로 폴백된다.
 */
function collectLastModifiedDates(): Map<string, string> {
  const dates = new Map<string, string>();

  const result = spawnSync(
    'git',
    // core.quotePath=false: 한글 등 비ASCII 파일명을 octal 이스케이프 없이 UTF-8 그대로 출력
    ['-c', 'core.quotePath=false', 'log', '--name-only', '--date=short', '--format=%ad', '--', 'content'],
    { cwd: process.cwd(), encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 }
  );

  if (result.error || result.status !== 0) return dates;

  let currentDate = '';
  for (const raw of result.stdout.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (/^\d{4}-\d{2}-\d{2}$/.test(line)) {
      currentDate = line;
      continue;
    }
    // git log는 최신 커밋부터 → 각 파일의 첫 등장이 가장 최근 수정일
    if (line.startsWith('content/') && line.endsWith('.mdx')) {
      const relative = line.slice('content/'.length);
      if (!dates.has(relative)) dates.set(relative, currentDate);
    }
  }

  return dates;
}

/** 모든 MDX 파일을 최신 수정일 기준 내림차순으로 정렬한 전체 목록을 만든다. */
async function computeRecentArticles(): Promise<RecentArticle[]> {
  const sections = await getAllMDXNestedSections();
  const dates = collectLastModifiedDates();

  const files: MDXFileNode[] = [];
  const walk = (nodes: MDXFileNode[]) => {
    for (const node of nodes) {
      if (node.type === 'file') files.push(node);
      else if (node.children) walk(node.children);
    }
  };
  for (const { tree } of sections) walk(tree);

  const articles: RecentArticle[] = files.map((node) => ({
    title: node.title,
    description: node.description,
    href: buildDocsPath(...node.fullPath),
    crumbs: node.fullPath.slice(0, -1), // 파일 slug 제외 = 디렉토리 경로
    updated: dates.get(node.path) ?? '',
  }));

  // 날짜 내림차순 — 빈 문자열('')은 자연히 뒤로 밀린다. 동일 날짜는 제목순.
  articles.sort(
    (a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title)
  );

  return articles;
}

// 요청 간 지속되는 데이터 캐시. 작은 출력(본문 없음)만 담아 가볍다.
// 315개 파일 디스크 읽기 + git log를 캐시 미스 때만 실행한다.
const getAllRecentArticlesCached = unstable_cache(
  computeRecentArticles,
  ['recent-articles-v1'],
  { revalidate: RECENT_REVALIDATE, tags: ['content'] }
);

/** 최신 수정일순 글 목록 (limit 생략 시 전체). 결과는 캐시되고 limit은 캐시 밖에서 슬라이스한다. */
export async function getRecentArticles(limit?: number): Promise<RecentArticle[]> {
  const all = await getAllRecentArticlesCached();
  return limit ? all.slice(0, limit) : all;
}
