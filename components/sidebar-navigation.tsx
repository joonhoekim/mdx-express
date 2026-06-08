"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/lib/navigation";
import { isNavigationItemActive } from "@/lib/navigation-utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ROW = "w-full justify-start gap-2 h-auto min-h-9 whitespace-normal py-1.5 text-left";

/** 폴더(자식 있는 디렉토리) — 접기/펴기 + 음영 + 자식 들여쓰기 가이드 */
function NavFolder({ item, pathname }: { item: NavigationItem; pathname: string }) {
  const [open, setOpen] = useState(() => isNavigationItemActive(item, pathname));

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
      <Link href={item.href}>
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

  if (sidebarItems.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="h-full py-4">
      <div className="space-y-1 px-3">
        {sidebarItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </ScrollArea>
  );
}
