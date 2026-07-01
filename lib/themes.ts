/**
 * 컬러 테마 레지스트리 — tweakcn 기반 다중 테마 전환.
 *
 * "모드"(라이트/다크)는 next-themes(`.dark` 클래스)가 담당하고,
 * 여기의 "컬러 테마"는 별도 축으로 `<html data-theme="...">` 속성으로 적용된다.
 * 실제 CSS 변수 값은 `app/globals.css`의 `[data-theme='id']` 블록에 있다.
 *
 * ── 새 테마 추가 방법 ──────────────────────────────────────────────
 * 1. https://tweakcn.com 에서 테마를 만들고 registry JSON을 받는다
 *    (예: `curl -sL https://tweakcn.com/r/themes/<id>`).
 * 2. `cssVars.light` / `cssVars.dark`의 색상·radius 변수를 globals.css에
 *    `[data-theme='새id'] { ... }` 와 `[data-theme='새id'].dark { ... }` 로 추가.
 *    (폰트 변수는 한글/코딩 폰트 스택 유지를 위해 가져오지 않는다.)
 * 3. 아래 COLOR_THEMES 배열에 `{ id, label }` 한 줄 추가.
 * ─────────────────────────────────────────────────────────────────
 */

export interface ColorTheme {
  /** `data-theme` 속성값이자 localStorage에 저장되는 식별자 */
  id: string;
  /** 스위처 UI에 표시되는 이름 */
  label: string;
  /**
   * dark-first 테마 — 원본이 라이트/다크 구분 없이 어두운 팔레트로 설계됨.
   * true면 이 테마 선택 시 다크 모드로 고정되고 라이트/다크 토글이 잠긴다
   * (배경과 `.dark` 스코프 컴포넌트 스타일·`dark:` 유틸리티의 일관성 유지).
   */
  forceDark?: boolean;
}

/**
 * 'default'는 globals.css의 기본 `:root`/`.dark` 블록을 그대로 쓰는 테마다
 * (별도 `[data-theme]` 블록 없음). 나머지는 각자 오버라이드 블록을 가진다.
 */
export const COLOR_THEMES: ColorTheme[] = [
  { id: "default", label: "기본" },
  { id: "claude", label: "Claude +" },
  { id: "zen", label: "Zen Inspired" },
  { id: "terminal", label: "Terminal", forceDark: true },
  { id: "terminal-muted", label: "Terminal Muted" },
  { id: "realmorphism", label: "Realmorphism" },
  { id: "optimus", label: "Optimus", forceDark: true },
];

/** 최초 방문(저장값 없음) 시 사용할 기본 컬러 테마 */
export const DEFAULT_COLOR_THEME = "claude";

/** localStorage 키 (블로킹 스크립트와 Provider가 공유) */
export const COLOR_THEME_STORAGE_KEY = "color-theme";

/**
 * forceDark 테마 진입 직전의 라이트/다크 모드를 보관하는 키.
 * 테마를 벗어날 때 원래 모드를 복원해 사용자 선호를 유지한다.
 */
export const PREV_MODE_STORAGE_KEY = "color-theme-prev-mode";

export const COLOR_THEME_IDS = COLOR_THEMES.map((t) => t.id);

export const FORCE_DARK_THEME_IDS = COLOR_THEMES.filter((t) => t.forceDark).map(
  (t) => t.id,
);

export function isValidColorTheme(value: string | null | undefined): value is string {
  return !!value && COLOR_THEME_IDS.includes(value);
}

/** 해당 컬러 테마가 다크 모드로 고정되어야 하는지 */
export function isForceDarkTheme(value: string | null | undefined): boolean {
  return !!value && FORCE_DARK_THEME_IDS.includes(value);
}
