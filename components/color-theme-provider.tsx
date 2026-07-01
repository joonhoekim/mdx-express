"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_COLOR_THEME,
  PREV_MODE_STORAGE_KEY,
  isForceDarkTheme,
  isValidColorTheme,
} from "@/lib/themes";

interface ColorThemeContextValue {
  /** 현재 컬러 테마 id */
  colorTheme: string;
  /** 컬러 테마 변경 (`data-theme` + localStorage 동기화) */
  setColorTheme: (id: string) => void;
}

const ColorThemeContext = React.createContext<ColorThemeContextValue | null>(null);

/**
 * 컬러 테마 축(next-themes의 다크/라이트와 직교) 상태 관리.
 * 초기값은 `ColorThemeScript`가 이미 세팅한 `<html data-theme>`에서 읽어
 * 하이드레이션 불일치를 피한다.
 *
 * forceDark 테마가 활성일 때는 next-themes 모드를 dark로 강제하고,
 * 진입 직전 모드를 `PREV_MODE_STORAGE_KEY`에 보관했다가 테마를 벗어날 때
 * 복원한다(사용자의 라이트/다크 선호 보존).
 */
export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = React.useState(DEFAULT_COLOR_THEME);
  const { theme, setTheme } = useTheme();

  // 블로킹 스크립트가 세팅한 DOM 값과 동기화 (마운트 후 1회)
  React.useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (isValidColorTheme(current)) {
      setColorThemeState(current);
    }
  }, []);

  // forceDark 테마 진입/이탈에 따라 다크 모드 고정/복원
  React.useEffect(() => {
    if (isForceDarkTheme(colorTheme)) {
      try {
        // 진입 직전 모드를 1회만 저장 (재방문 시 덮어쓰지 않음)
        if (localStorage.getItem(PREV_MODE_STORAGE_KEY) === null) {
          localStorage.setItem(PREV_MODE_STORAGE_KEY, theme ?? "system");
        }
      } catch {
        // localStorage 접근 불가 — 복원 없이 다크 고정만 수행
      }
      if (theme !== "dark") setTheme("dark");
    } else {
      try {
        const prev = localStorage.getItem(PREV_MODE_STORAGE_KEY);
        if (prev !== null) {
          localStorage.removeItem(PREV_MODE_STORAGE_KEY);
          if (theme !== prev) setTheme(prev);
        }
      } catch {
        // 무시
      }
    }
    // theme는 이펙트 실행 시점 값만 읽고, 트리거는 colorTheme 전환으로 한정
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorTheme]);

  const setColorTheme = React.useCallback((id: string) => {
    if (!isValidColorTheme(id)) return;
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, id);
    } catch {
      // localStorage 접근 불가(프라이빗 모드 등) — 세션 한정으로 동작
    }
    setColorThemeState(id);
  }, []);

  const value = React.useMemo(
    () => ({ colorTheme, setColorTheme }),
    [colorTheme, setColorTheme],
  );

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const ctx = React.useContext(ColorThemeContext);
  if (!ctx) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return ctx;
}
