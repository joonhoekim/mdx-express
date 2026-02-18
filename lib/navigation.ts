'use server';

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { cache } from 'react';
import { naturalCompare } from './utils';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: string; // 아이콘 이름을 문자열로 저장
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
      title: dir.charAt(0).toUpperCase() + dir.slice(1),
      href: `/docs/${dir}`,
      icon: 'FileText',
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[getTopLevelItems] ${message}`);
    return [
      {
        title: '문서',
        href: '/docs',
        icon: 'FileText',
      },
    ];
  }
});

// 현재 경로에 기반하여 사이드바 아이템을 동적으로 생성 (캐시됨)
export const getSidebarItems = cache(async (
  pathname: string
): Promise<NavigationItem[]> => {
  const staticItems: NavigationItem[] = [];

  if (pathname.startsWith('/docs')) {
    try {
      const { getAllMDXSections } = await import('./mdx-utils');
      const sections = await getAllMDXSections();

      for (const section of sections) {
        // 파일과 디렉토리를 합쳐서 children 생성
        const fileItems: NavigationItem[] = section.files.map((file) => ({
          title: file.title,
          href: `/docs/${section.section}/${file.slug}`,
        }));

        const dirItems: NavigationItem[] = section.directories.map((dir) => ({
          title: dir.title,
          href: `/docs/${section.section}/${dir.slug}`,
        }));

        // 파일과 디렉토리를 합치고, order 기준으로 정렬
        const allItems = [...fileItems, ...dirItems];

        staticItems.push({
          title:
            section.section.charAt(0).toUpperCase() + section.section.slice(1),
          href: `/docs/${section.section}`,
          icon: 'FileText',
          children: allItems,
        });
      }
    } catch (error) {
      console.error('Error loading MDX navigation:', error);
    }
  }

  return staticItems;
});

// 네비게이션 아이템이 활성 상태인지 확인
export async function isNavigationItemActive(
  item: NavigationItem,
  pathname: string
): Promise<boolean> {
  if (item.href === pathname) {
    return true;
  }

  if (item.children) {
    // async 재귀 호출을 위해 Promise.all 사용
    const childResults = await Promise.all(
      item.children.map((child) => isNavigationItemActive(child, pathname))
    );
    return childResults.some((result) => result);
  }

  return false;
}

// 현재 경로에서 활성 상태인 최상위 네비게이션 아이템 찾기
export async function getActiveTopLevelItem(
  pathname: string
): Promise<NavigationItem | undefined> {
  const topLevel = await getTopLevelItems();
  return topLevel.find((item) => pathname.startsWith(item.href));
}
