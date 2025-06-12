"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationStructure, getActiveTopLevelItem } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./mobile-sidebar";

export function TopNavigation() {
  const pathname = usePathname();
  const activeItem = getActiveTopLevelItem(pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-4">
          <MobileSidebar />
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">MDX Express</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-2">
          {navigationStructure.topLevel.map((item) => {
            const Icon = item.icon;
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