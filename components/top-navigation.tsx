"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/lib/navigation";
import { findActiveTopLevelItem, getIconComponent } from "@/lib/navigation-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

interface TopNavigationProps {
  topLevelItems: NavigationItem[];
}

export function TopNavigation({ topLevelItems }: TopNavigationProps) {
  const pathname = usePathname();

  // 클라이언트에서 활성 아이템 찾기 (서버 액션 헬퍼 사용)
  const activeItem = findActiveTopLevelItem(topLevelItems, pathname);

  // 모바일에서 보여줄 아이템 수 제한
  const visibleItems = topLevelItems.slice(0, 3);
  const hiddenItems = topLevelItems.slice(3);

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-4 shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-sm sm:text-base">MDX Express</span>
          </Link>
        </div>

        <nav className="flex items-center gap-1 overflow-hidden">
          {/* 데스크톱: 모든 아이템 표시 */}
          <div className="hidden lg:flex items-center gap-2">
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
                    "gap-2 shrink-0",
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
          </div>

          {/* 태블릿: 일부 아이템 + 드롭다운 */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
            {visibleItems.map((item) => {
              const Icon = getIconComponent(item.icon);
              const isActive = activeItem?.href === item.href;

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 shrink-0",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Link href={item.href}>
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="hidden sm:inline">{item.title}</span>
                  </Link>
                </Button>
              );
            })}

            {hiddenItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <span className="text-xs">더보기</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {hiddenItems.map((item) => {
                    const Icon = getIconComponent(item.icon);
                    const isActive = activeItem?.href === item.href;

                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2",
                            isActive && "bg-accent"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* 모바일: 햄버거 메뉴 */}
          <div className="flex md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {topLevelItems.map((item) => {
                  const Icon = getIconComponent(item.icon);
                  const isActive = activeItem?.href === item.href;

                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2",
                          isActive && "bg-accent"
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  );
} 