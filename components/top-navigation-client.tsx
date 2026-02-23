"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
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

interface TopNavigationClientProps {
    topLevelItems: NavigationItem[];
}

export function TopNavigationClient({ topLevelItems }: TopNavigationClientProps) {
    const pathname = usePathname();

    // 메모이제이션으로 불필요한 재계산 방지
    const { activeItem, visibleItems, hiddenItems } = useMemo(() => {
        const active = findActiveTopLevelItem(topLevelItems, pathname);
        const visible = topLevelItems.slice(0, 3);
        const hidden = topLevelItems.slice(3);

        return {
            activeItem: active,
            visibleItems: visible,
            hiddenItems: hidden
        };
    }, [topLevelItems, pathname]);

    return (
        <nav className="flex items-center gap-1 overflow-hidden justify-end">
            {/* 태블릿: 일부 아이템 + 드롭다운 */}
            <div className="hidden md:flex lg:hidden items-center gap-2 overflow-x-auto scrollbar-hide">
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
    );
}
