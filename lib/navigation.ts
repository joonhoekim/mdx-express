'use server';

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: string; // 아이콘 이름을 문자열로 저장
  children?: NavigationItem[];
  isActive?: boolean;
}

export interface NavigationStructure {
  topLevel: NavigationItem[];
  sidebarItems: NavigationItem[];
}

// content 폴더에서 최상위 디렉토리들을 읽어와서 topLevel 아이템 생성
export async function getTopLevelItems(): Promise<NavigationItem[]> {
  try {
    const contentPath = join(process.cwd(), 'content');
    const directories = readdirSync(contentPath).filter((item) => {
      const itemPath = join(contentPath, item);
      return statSync(itemPath).isDirectory();
    });

    return directories.map((dir) => ({
      title: dir.charAt(0).toUpperCase() + dir.slice(1), // 첫 글자 대문자로
      href: `/docs/${dir}`,
      icon: 'FileText',
    }));
  } catch (error) {
    console.error('Error reading content directories:', error);
    return [
      {
        title: '문서',
        href: '/docs',
        icon: 'FileText',
      },
    ]; // 기본값 반환
  }
}

// 동적 네비게이션 구조 생성
export async function getNavigationStructure(): Promise<NavigationStructure> {
  const topLevel = await getTopLevelItems();

  return {
    topLevel,
    sidebarItems: [],
  };
}

// 현재 경로에 기반하여 사이드바 아이템을 동적으로 생성
export async function getSidebarItems(
  pathname: string
): Promise<NavigationItem[]> {
  const staticItems: NavigationItem[] = [];

  if (pathname.startsWith('/dashboard')) {
    staticItems.push(
      {
        title: '개요',
        href: '/dashboard',
        icon: 'Home',
      },
      {
        title: '분석',
        href: '/dashboard/analytics',
        icon: 'BarChart3',
        children: [
          {
            title: '리포트',
            href: '/dashboard/analytics/reports',
          },
        ],
      }
    );
  }

  if (pathname.startsWith('/settings')) {
    staticItems.push(
      {
        title: '일반',
        href: '/settings',
        icon: 'Settings',
      },
      {
        title: '프로필',
        href: '/settings/profile',
      }
    );
  }

  if (pathname.startsWith('/projects')) {
    staticItems.push({
      title: '모든 프로젝트',
      href: '/projects',
      icon: 'FolderOpen',
    });
  }

  // docs 경로에 대한 MDX 네비게이션 생성
  if (pathname.startsWith('/docs')) {
    try {
      const { getAllMDXSections } = await import('./mdx-utils');
      const sections = await getAllMDXSections();

      for (const section of sections) {
        staticItems.push({
          title:
            section.section.charAt(0).toUpperCase() + section.section.slice(1),
          href: `/docs/${section.section}`,
          icon: 'FileText',
          children: section.files.map((file) => ({
            title: file.title,
            href: `/docs/${section.section}/${file.slug}`,
          })),
        });
      }
    } catch (error) {
      console.error('Error loading MDX navigation:', error);
    }
  }

  return staticItems;
}

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
