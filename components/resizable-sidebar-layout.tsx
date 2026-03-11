"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 256;
const STORAGE_KEY = "sidebar-state";

type ContentWidth = "small" | "medium" | "large" | "full";
const DEFAULT_CONTENT_WIDTH: ContentWidth = "medium";
const CONTENT_WIDTH_CLASSES: Record<ContentWidth, string> = {
  small: "max-w-3xl",
  medium: "max-w-4xl",
  large: "max-w-6xl",
  full: "max-w-none",
};
const CONTENT_WIDTH_OPTIONS: { value: ContentWidth; label: string; innerWidth: number }[] = [
  { value: "small", label: "좁게", innerWidth: 4 },
  { value: "medium", label: "보통", innerWidth: 7 },
  { value: "large", label: "넓게", innerWidth: 10 },
  { value: "full", label: "전체", innerWidth: 14 },
];

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
  const [contentWidth, setContentWidth] = useState<ContentWidth>(DEFAULT_CONTENT_WIDTH);
  const [hasMounted, setHasMounted] = useState(false);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { width, collapsed, contentWidth: cw } = JSON.parse(saved);
        if (typeof width === "number")
          setSidebarWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width)));
        if (typeof collapsed === "boolean") setIsCollapsed(collapsed);
        if (typeof cw === "string" && cw in CONTENT_WIDTH_CLASSES)
          setContentWidth(cw as ContentWidth);
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
        JSON.stringify({ width: sidebarWidth, collapsed: isCollapsed, contentWidth })
      );
    } catch {}
  }, [sidebarWidth, isCollapsed, contentWidth, hasMounted]);

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
        {/* Floating toolbar */}
        <div className="hidden md:flex sticky top-0 z-10 h-0 overflow-visible items-start justify-between pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            className="relative top-1.5 left-1.5 h-7 w-7 opacity-40 hover:opacity-100 transition-opacity pointer-events-auto"
            onClick={() => setIsCollapsed((v) => !v)}
            title={isCollapsed ? "사이드바 열기" : "사이드바 닫기"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          {/* Content width controls */}
          <div className="relative top-1.5 right-1.5 flex items-center gap-0.5 pointer-events-auto">
            {CONTENT_WIDTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={cn(
                  "h-7 w-7 flex items-center justify-center rounded-md transition-opacity",
                  "hover:bg-accent hover:text-accent-foreground",
                  contentWidth === opt.value
                    ? "opacity-100"
                    : "opacity-25 hover:opacity-60"
                )}
                onClick={() => setContentWidth(opt.value)}
                title={opt.label}
              >
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                  <rect x="0.5" y="0.5" width="15" height="13" rx="1.5" stroke="currentColor" opacity="0.5" />
                  <rect
                    x={(16 - opt.innerWidth) / 2}
                    y="3"
                    width={opt.innerWidth}
                    height="8"
                    rx="1"
                    fill="currentColor"
                    opacity="0.7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className={cn("mx-auto py-6 px-4 md:px-6 transition-[max-width] duration-200", CONTENT_WIDTH_CLASSES[contentWidth])}>
          {children}
        </div>
      </main>
    </div>
  );
}
