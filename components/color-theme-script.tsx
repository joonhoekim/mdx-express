import {
  COLOR_THEME_IDS,
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_COLOR_THEME,
  FORCE_DARK_THEME_IDS,
} from "@/lib/themes";

/**
 * 하이드레이션 이전에 `<html data-theme>`를 세팅해 컬러 테마 FOUC를 막는다.
 * next-themes가 `.dark` 클래스를 처리하는 것과 동일한 블로킹 스크립트 패턴.
 * `<head>`에서 동기 실행되어야 하므로 `beforeInteractive`가 아니라
 * 순수 인라인 `<script>`로 삽입한다.
 *
 * dark-first(forceDark) 테마면 `.dark` 클래스도 미리 붙여 라이트 플래시를 막는다.
 * (진입 시 Provider가 next-themes 모드를 dark로 영속화하므로 재방문 시에도 일치)
 */
export function ColorThemeScript() {
  const script = `(function(){try{var k=${JSON.stringify(
    COLOR_THEME_STORAGE_KEY,
  )};var ids=${JSON.stringify(COLOR_THEME_IDS)};var fd=${JSON.stringify(
    FORCE_DARK_THEME_IDS,
  )};var d=${JSON.stringify(
    DEFAULT_COLOR_THEME,
  )};var t=localStorage.getItem(k);if(ids.indexOf(t)===-1)t=d;var el=document.documentElement;el.setAttribute('data-theme',t);if(fd.indexOf(t)!==-1){el.classList.add('dark');el.style.colorScheme='dark';}}catch(e){document.documentElement.setAttribute('data-theme',${JSON.stringify(
    DEFAULT_COLOR_THEME,
  )});}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
