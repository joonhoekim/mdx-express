'use server';

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { naturalCompare, formatTitle } from './utils';
import { getErrorMessage } from './get-error-message';
import { buildDocsPath } from './build-docs-path';
import type { MDXFileNode } from './mdx-utils';

// 콘텐츠는 배포 사이에 거의 안 변하므로 길게 캐시. dev는 짧게 둬 수정이 빨리 반영되게 한다.
const NAV_REVALIDATE = process.env.NODE_ENV === 'development' ? 10 : 3600;

export interface NavigationItem {
  title: string;
  href: string;
  icon?: string; // 아이콘 이름을 문자열로 저장
  type?: 'file' | 'directory';
  children?: NavigationItem[];
  isActive?: boolean;
}

// content 폴더에서 최상위 디렉토리들을 읽어와서 topLevel 아이템 생성 (캐시됨)
export const getTopLevelItems = cache(async (): Promise<NavigationItem[]> => {
  try {
    const contentPath = join(process.cwd(), 'content');
    const items = await readdir(contentPath);

    const directories: string[] = [];
    for (const item of items) {
      const itemPath = join(contentPath, item);
      const itemStat = await stat(itemPath);
      if (itemStat.isDirectory()) {
        directories.push(item);
      }
    }

    directories.sort(naturalCompare);

    return directories.map((dir) => ({
      title: formatTitle(dir),
      href: buildDocsPath(dir),
    }));
  } catch (error) {
    console.error(`[getTopLevelItems] ${getErrorMessage(error)}`);
    return [
      {
        title: '문서',
        href: '/docs',
      },
    ];
  }
});

// MDXFileNode 트리를 NavigationItem 트리로 재귀 변환
function convertTreeToNavItems(nodes: MDXFileNode[], basePath: string): NavigationItem[] {
  return nodes
    .map(node => ({
      title: node.title,
      href: buildDocsPath(basePath, node.slug),
      type: node.type,
      ...(node.type === 'directory' && node.children?.length
        ? { children: convertTreeToNavItems(node.children, `${basePath}/${node.slug}`) }
        : {}),
    }));
}

// 사이드바 트리(전체 섹션)를 요청 간 데이터 캐시에 보관한다.
// 출력은 본문 없는 NavigationItem[]이라 가볍고, 캐시 히트 시 content/ 전체 읽기를 건너뛴다.
// pathname과 무관한 구조라 키는 상수 — 모든 docs 페이지가 한 캐시 항목을 공유한다.
const getCachedSidebarTree = unstable_cache(
  async (): Promise<NavigationItem[]> => {
    const { getAllMDXNestedSections } = await import('./mdx-utils');
    const sections = await getAllMDXNestedSections();

    return sections.map((section) => ({
      title: formatTitle(section.section),
      href: buildDocsPath(section.section),
      children: convertTreeToNavItems(section.tree, section.section),
    }));
  },
  ['sidebar-tree-v1'],
  { revalidate: NAV_REVALIDATE, tags: ['content'] }
);

// 현재 경로에 기반하여 사이드바 아이템을 생성 (요청 내 cache + 요청 간 데이터 캐시)
export const getSidebarItems = cache(async (
  pathname: string
): Promise<NavigationItem[]> => {
  if (!pathname.startsWith('/docs')) return [];

  try {
    return await getCachedSidebarTree();
  } catch (error) {
    console.error('Error loading MDX navigation:', error);
    return [];
  }
});
