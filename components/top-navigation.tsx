"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/lib/navigation";
import { findActiveTopLevelItem, getIconComponent } from "@/lib/navigation-utils";
import { Button } from "@/components/ui/button";

interface TopNavigationProps {
  topLevelItems: NavigationItem[];
}

export function TopNavigation({ topLevelItems }: TopNavigationProps) {
  const pathname = usePathname();

  // 클라이언트에서 활성 아이템 찾기 (서버 액션 헬퍼 사용)
  const activeItem = findActiveTopLevelItem(topLevelItems, pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">MDX Express</span>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          {topLevelItems.map((item) => {
            const Icon = getIconComponent(item.icon);
            const isActive = activeItem?.href === item.href;

            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Link href={item.href}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
} 