import Link from "next/link";
import { NavigationItem } from "@/lib/navigation";
import { getIconComponent } from "@/lib/navigation-utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { TopNavigationClient } from "./top-navigation-client";
import { headers } from 'next/headers';

interface TopNavigationServerProps {
    topLevelItems: NavigationItem[];
}

export async function TopNavigationServer({ topLevelItems }: TopNavigationServerProps) {
    // 서버에서 현재 경로 확인
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/';

    return (
        <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-screen-xl mx-auto flex h-16 items-center px-4">
                <div className="flex items-center gap-2 mr-4 shrink-0">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-sm sm:text-base">MDX Express</span>
                    </Link>
                </div>

                {/* 데스크톱: 서버에서 정적 렌더링 */}
                <nav className="hidden lg:flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-hide">
                    {topLevelItems.map((item) => {
                        const Icon = getIconComponent(item.icon);
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <Button
                                key={item.href}
                                asChild
                                variant={isActive ? "default" : "ghost"}
                                size="sm"
                                className={isActive ? "gap-2 shrink-0 bg-primary text-primary-foreground" : "gap-2 shrink-0"}
                            >
                                <Link href={item.href}>
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {item.title}
                                </Link>
                            </Button>
                        );
                    })}
                </nav>

                {/* 모바일/태블릿: 클라이언트 컴포넌트로 처리 */}
                <div className="lg:hidden flex-1">
                    <TopNavigationClient topLevelItems={topLevelItems} />
                </div>

                <div className="ml-auto shrink-0 pl-2">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
