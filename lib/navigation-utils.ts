import { NavigationItem } from './navigation';
import {
  BarChart3,
  Settings,
  FolderOpen,
  Home,
  FileText,
  LucideIcon,
} from 'lucide-react';

// 아이콘 문자열을 실제 컴포넌트로 매핑
const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  Settings,
  FolderOpen,
  Home,
  FileText,
};

// 아이콘 문자열을 컴포넌트로 변환
export function getIconComponent(iconName?: string): LucideIcon | undefined {
  if (!iconName) return undefined;
  return iconMap[iconName];
}

// 클라이언트에서 사용할 수 있는 간단한 활성 아이템 찾기 헬퍼 (동기)
export function findActiveTopLevelItem(
  topLevelItems: NavigationItem[],
  pathname: string
): NavigationItem | undefined {
  return topLevelItems.find((item) => pathname.startsWith(item.href));
}

// 클라이언트에서 사용할 수 있는 네비게이션 아이템 활성 상태 확인 (동기)
export function isNavigationItemActiveSync(
  item: NavigationItem,
  pathname: string
): boolean {
  if (item.href === pathname) {
    return true;
  }

  if (item.children) {
    return item.children.some((child) =>
      isNavigationItemActiveSync(child, pathname)
    );
  }

  return false;
}
