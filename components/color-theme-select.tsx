"use client";

import * as React from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COLOR_THEMES } from "@/lib/themes";
import { useColorTheme } from "@/components/color-theme-provider";

/**
 * 컬러 테마 스위처 — 상단 내비게이션의 다크/라이트 토글 옆에 배치.
 * 다크/라이트와 독립적으로 tweakcn 테마를 전환한다.
 */
export function ColorThemeSelect() {
  const { colorTheme, setColorTheme } = useColorTheme();
  const [mounted, setMounted] = React.useState(false);

  // 하이드레이션 불일치 방지: 마운트 전에는 선택 표시를 렌더하지 않음
  React.useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="컬러 테마 선택">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>컬러 테마</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={mounted ? colorTheme : ""}
          onValueChange={setColorTheme}
        >
          {COLOR_THEMES.map((theme) => (
            <DropdownMenuRadioItem key={theme.id} value={theme.id}>
              <span className="flex w-full items-center justify-between gap-4">
                {theme.label}
                {theme.forceDark && (
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    다크 전용
                  </span>
                )}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
