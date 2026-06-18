import { spawnSync } from 'child_process';
import { getAllMDXNestedSections } from './mdx-tree';
import { buildDocsPath } from './build-docs-path';
import type { MDXFileNode } from './mdx-types';

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

/** 모든 MDX 파일을 최신 수정일 기준 내림차순으로 정렬해 반환한다 (limit 생략 시 전체). */
export async function getRecentArticles(limit?: number): Promise<RecentArticle[]> {
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

  return limit ? articles.slice(0, limit) : articles;
}
