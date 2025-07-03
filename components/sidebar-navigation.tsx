"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/lib/navigation";
import { isNavigationItemActiveSync, getIconComponent } from "@/lib/navigation-utils";
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
  const [isOpen, setIsOpen] = useState(isNavigationItemActiveSync(item, pathname));
  const isActive = item.href === pathname;
  const hasChildren = item.children && item.children.length > 0;
  const Icon = getIconComponent(item.icon);

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
                isNavigationItemActiveSync(item, pathname) && "bg-accent"
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

interface SidebarNavigationProps {
  sidebarItems: NavigationItem[];
}

export function SidebarNavigation({ sidebarItems }: SidebarNavigationProps) {
  const pathname = usePathname();
  const [dynamicItems, setDynamicItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSiblingFiles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/sibling-files?pathname=${encodeURIComponent(pathname)}`);
        if (response.ok) {
          const data = await response.json();
          setDynamicItems(data.files || []);
        }
      } catch (error) {
        console.error('Error fetching sibling files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiblingFiles();
  }, [pathname]);

  // 동적으로 가져온 아이템들을 사용하거나, 없으면 props의 아이템들 사용
  const itemsToRender = dynamicItems.length > 0 ? dynamicItems : sidebarItems;

  if (isLoading) {
    return (
      <div className="hidden md:block w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ScrollArea className="h-full py-4">
          <div className="space-y-1 px-3">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (itemsToRender.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ScrollArea className="h-full py-4">
        <div className="space-y-1 px-3">
          {itemsToRender.map((item) => (
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
interface SidebarNavigationContentProps {
  sidebarItems: NavigationItem[];
}

export function SidebarNavigationContent({ sidebarItems }: SidebarNavigationContentProps) {
  const pathname = usePathname();
  const [dynamicItems, setDynamicItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSiblingFiles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/sibling-files?pathname=${encodeURIComponent(pathname)}`);
        if (response.ok) {
          const data = await response.json();
          setDynamicItems(data.files || []);
        }
      } catch (error) {
        console.error('Error fetching sibling files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiblingFiles();
  }, [pathname]);

  // 동적으로 가져온 아이템들을 사용하거나, 없으면 props의 아이템들 사용
  const itemsToRender = dynamicItems.length > 0 ? dynamicItems : sidebarItems;

  if (isLoading) {
    return (
      <ScrollArea className="h-full py-4">
        <div className="space-y-1 px-3">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-8 bg-muted rounded animate-pulse" />
        </div>
      </ScrollArea>
    );
  }

  if (itemsToRender.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="h-full py-4">
      <div className="space-y-1 px-3">
        {itemsToRender.map((item) => (
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