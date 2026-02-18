"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 256;
const STORAGE_KEY = "sidebar-state";

interface ResizableSidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function ResizableSidebarLayout({
  sidebar,
  children,
}: ResizableSidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { width, collapsed } = JSON.parse(saved);
        if (typeof width === "number")
          setSidebarWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width)));
        if (typeof collapsed === "boolean") setIsCollapsed(collapsed);
      }
    } catch {}
    setHasMounted(true);
  }, []);

  // Persist state
  useEffect(() => {
    if (!hasMounted) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ width: sidebarWidth, collapsed: isCollapsed })
      );
    } catch {}
  }, [sidebarWidth, isCollapsed, hasMounted]);

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const startX = e.clientX;
      const startWidth = sidebarWidth;

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      const onMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX;
        setSidebarWidth(
          Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + delta))
        );
      };

      const onMouseUp = () => {
        setIsDragging(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [sidebarWidth]
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex shrink-0 flex-col relative border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden",
          !isDragging && "transition-[width] duration-200 ease-in-out",
          isCollapsed && "border-r-0"
        )}
        style={{ width: isCollapsed ? 0 : sidebarWidth }}
      >
        <div className="flex-1 overflow-y-auto min-w-0">{sidebar}</div>

        {/* Resize handle */}
        {!isCollapsed && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-border/60 active:bg-border z-10 transition-colors"
            onMouseDown={startResize}
          />
        )}
      </aside>

      {/* Content area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Floating toggle button */}
        <div className="hidden md:block sticky top-0 z-10 h-0 overflow-visible">
          <Button
            variant="ghost"
            size="icon"
            className="relative top-1.5 left-1.5 h-7 w-7 opacity-40 hover:opacity-100 transition-opacity"
            onClick={() => setIsCollapsed((v) => !v)}
            title={isCollapsed ? "사이드바 열기" : "사이드바 닫기"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="container mx-auto py-6 px-6 max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
