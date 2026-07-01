"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useColorTheme } from "@/components/color-theme-provider"
import { isForceDarkTheme } from "@/lib/themes"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const { colorTheme } = useColorTheme()

  // dark-first 테마는 다크로 고정 — 토글을 잠근다
  const locked = isForceDarkTheme(colorTheme)

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={locked}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={locked ? "이 테마는 다크 모드로 고정됩니다" : "테마 전환"}
      title={locked ? "이 테마는 다크 모드로 고정됩니다" : undefined}
      className={locked ? "cursor-not-allowed" : undefined}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
