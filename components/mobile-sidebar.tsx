"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigationContent } from "./sidebar-navigation";
import { NavigationItem } from "@/lib/navigation";

interface MobileSidebarProps {
  sidebarItems: NavigationItem[];
}

export function MobileSidebar({ sidebarItems }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div onClick={() => setOpen(false)}>
          <SidebarNavigationContent sidebarItems={sidebarItems} />
        </div>
      </SheetContent>
    </Sheet>
  );
} 