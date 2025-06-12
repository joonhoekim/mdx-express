"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavigationItemActive, NavigationItem } from "@/lib/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

interface SidebarNavigationItemProps {
  item: NavigationItem;
  pathname: string;
  level?: number;
}

function SidebarNavigationItem({ item, pathname, level = 0 }: SidebarNavigationItemProps) {
  const [isOpen, setIsOpen] = useState(isNavigationItemActive(item, pathname));
  const isActive = item.href === pathname;
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="space-y-1">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 hover:bg-accent",
                level > 0 && "ml-4",
                isNavigationItemActive(item, pathname) && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                {Icon && <Icon className="h-4 w-4" />}
                <span className="truncate">{item.title}</span>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => (
              <SidebarNavigationItem
                key={child.href}
                item={child}
                pathname={pathname}
                level={level + 1}
              />
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 hover:bg-accent",
        level > 0 && "ml-4",
        isActive && "bg-secondary"
      )}
    >
      <Link href={item.href}>
        {Icon && <Icon className="h-4 w-4" />}
        <span className="truncate">{item.title}</span>
      </Link>
    </Button>
  );
}

export function SidebarNavigation() {
  const pathname = usePathname();
  const [sidebarItems, setSidebarItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSidebarItems() {
      try {
        // 동적 import를 사용하여 클라이언트에서 서버 함수 호출
        const { getSidebarItems } = await import('@/lib/navigation');
        const items = await getSidebarItems(pathname);
        setSidebarItems(items);
      } catch (error) {
        console.error('Error loading sidebar items:', error);
        setSidebarItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadSidebarItems();
  }, [pathname]);

  if (loading) {
    return (
      <div className="hidden md:block w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (sidebarItems.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ScrollArea className="h-full py-4">
        <div className="space-y-1 px-3">
          {sidebarItems.map((item) => (
            <SidebarNavigationItem
              key={item.href}
              item={item}
              pathname={pathname}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// 모바일용 사이드바 (Sheet에서 사용)
export function SidebarNavigationContent() {
  const pathname = usePathname();
  const [sidebarItems, setSidebarItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSidebarItems() {
      try {
        const { getSidebarItems } = await import('@/lib/navigation');
        const items = await getSidebarItems(pathname);
        setSidebarItems(items);
      } catch (error) {
        console.error('Error loading sidebar items:', error);
        setSidebarItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadSidebarItems();
  }, [pathname]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (sidebarItems.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="h-full py-4">
      <div className="space-y-1 px-3">
        {sidebarItems.map((item) => (
          <SidebarNavigationItem
            key={item.href}
            item={item}
            pathname={pathname}
          />
        ))}
      </div>
    </ScrollArea>
  );
} 