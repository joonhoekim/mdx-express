import {
  LucideIcon,
  BarChart3,
  Settings,
  FolderOpen,
  Home,
  FileText,
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  children?: NavigationItem[];
  isActive?: boolean;
}

export interface NavigationStructure {
  topLevel: NavigationItem[];
  sidebarItems: NavigationItem[];
}

// 네비게이션 구조 정의
export const navigationStructure: NavigationStructure = {
  topLevel: [
    {
      title: '대시보드',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: '문서',
      href: '/docs',
      icon: FileText,
    },
    {
      title: '프로젝트',
      href: '/projects',
      icon: FolderOpen,
    },
    {
      title: '설정',
      href: '/settings',
      icon: Settings,
    },
  ],
  sidebarItems: [],
};

// 현재 경로에 기반하여 사이드바 아이템을 동적으로 생성 (클라이언트용)
export async function getSidebarItems(pathname: string): Promise<NavigationItem[]> {
  const staticItems: NavigationItem[] = [];
  
  if (pathname.startsWith('/dashboard')) {
    staticItems.push(
      {
        title: '개요',
        href: '/dashboard',
        icon: Home,
      },
      {
        title: '분석',
        href: '/dashboard/analytics',
        icon: BarChart3,
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
        icon: Settings,
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
      icon: FolderOpen,
    });
  }

  // docs 경로에 대한 MDX 네비게이션 생성
  if (pathname.startsWith('/docs')) {
    try {
      const { getAllMDXSections } = await import('./mdx-utils');
      const sections = await getAllMDXSections();
      
      for (const section of sections) {
        staticItems.push({
          title: section.section.charAt(0).toUpperCase() + section.section.slice(1),
          href: `/docs/${section.section}`,
          icon: FileText,
          children: section.files.map(file => ({
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
export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string
): boolean {
  if (item.href === pathname) {
    return true;
  }

  if (item.children) {
    return item.children.some((child) =>
      isNavigationItemActive(child, pathname)
    );
  }

  return false;
}

// 현재 경로에서 활성 상태인 최상위 네비게이션 아이템 찾기
export function getActiveTopLevelItem(
  pathname: string
): NavigationItem | undefined {
  return navigationStructure.topLevel.find((item) =>
    pathname.startsWith(item.href)
  );
}
