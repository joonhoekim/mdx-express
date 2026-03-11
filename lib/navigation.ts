'use server';

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { cache } from 'react';
import { naturalCompare, formatTitle } from './utils';
import { getErrorMessage } from './get-error-message';
import { buildDocsPath } from './build-docs-path';
import type { MDXFileNode } from './mdx-utils';

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
    .filter(node => node.type === 'file' ? node.slug !== 'index' : true)
    .map(node => ({
      title: node.title,
      href: buildDocsPath(basePath, node.slug),
      type: node.type,
      ...(node.type === 'directory' && node.children?.length
        ? { children: convertTreeToNavItems(node.children, `${basePath}/${node.slug}`) }
        : {}),
    }));
}

// 현재 경로에 기반하여 사이드바 아이템을 동적으로 생성 (캐시됨)
export const getSidebarItems = cache(async (
  pathname: string
): Promise<NavigationItem[]> => {
  const staticItems: NavigationItem[] = [];

  if (pathname.startsWith('/docs')) {
    try {
      const { getAllMDXNestedSections } = await import('./mdx-utils');
      const sections = await getAllMDXNestedSections();

      for (const section of sections) {
        staticItems.push({
          title: formatTitle(section.section),
          href: buildDocsPath(section.section),
          children: convertTreeToNavItems(section.tree, section.section),
        });
      }
    } catch (error) {
      console.error('Error loading MDX navigation:', error);
    }
  }

  return staticItems;
});
