"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/lib/navigation";
import { isNavigationItemActive } from "@/lib/navigation-utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ROW = "w-full justify-start gap-2 h-auto min-h-9 whitespace-normal py-1.5 text-left";

/** 폴더(자식 있는 디렉토리) — 접기/펴기 + 음영 + 자식 들여쓰기 가이드 */
function NavFolder({ item, pathname }: { item: NavigationItem; pathname: string }) {
  const isActive = isNavigationItemActive(item, pathname);
  const [open, setOpen] = useState(isActive);

  // 글 이동(클라이언트 네비)으로 활성 경로에 들어오면 펼친다.
  // 활성이 풀려도 자동으로 접지 않아 사용자가 연 폴더를 보존한다.
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-1">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className={cn(ROW, "bg-muted/40 font-medium hover:bg-muted")}>
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90"
            )}
          />
          <span className="flex-1">{item.title}</span>
        </Button>
      </CollapsibleTrigger>
      {/* 자식 컨테이너에 들여쓰기를 줘 중첩될수록 누적된다 (위계 가이드선 포함) */}
      <CollapsibleContent>
        <div className="ml-3 space-y-1 border-l border-border/60 pl-2">
          {item.children!.map((child) => (
            <NavItem key={child.href} item={child} pathname={pathname} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** 단일 항목 — 폴더면 NavFolder, 파일이면 링크 */
function NavItem({ item, pathname }: { item: NavigationItem; pathname: string }) {
  if (item.children?.length) {
    return <NavFolder item={item} pathname={pathname} />;
  }

  const isActive = item.href === pathname;
  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className={cn(ROW, "hover:bg-accent", isActive && "font-medium")}
    >
      <Link href={item.href} data-active={isActive ? "true" : undefined}>
        <span>{item.title}</span>
      </Link>
    </Button>
  );
}

interface SidebarNavigationProps {
  sidebarItems: NavigationItem[];
}

export function SidebarNavigation({ sidebarItems }: SidebarNavigationProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // 글 이동 시 활성 항목을 사이드바 뷰포트 안에서만 가운데로 맞춘다.
  // 폴더 펼침(setOpen)이 DOM에 반영된 다음 프레임에 실행. 이미 보이면 건드리지 않는다.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector<HTMLElement>('[data-active="true"]');
      if (!el) return;
      const viewport = el.closest<HTMLElement>('[data-slot="scroll-area-viewport"]');
      if (!viewport) {
        el.scrollIntoView({ block: "nearest" });
        return;
      }
      const vpRect = viewport.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (elRect.top >= vpRect.top && elRect.bottom <= vpRect.bottom) return; // 이미 보임
      const delta =
        elRect.top - vpRect.top - (viewport.clientHeight - el.clientHeight) / 2;
      viewport.scrollTop += delta;
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  if (sidebarItems.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="h-full py-4">
      <div ref={containerRef} className="space-y-1 px-3">
        {sidebarItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </ScrollArea>
  );
}
