import { describe, test, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * content/ 트리에서 유효한 내부 doc 경로 집합을 만든다.
 * - .mdx 파일      → /docs/<상대경로 - .mdx>   (DocumentPage)
 * - 디렉터리       → /docs/<상대경로>           (SectionIndexPage)
 * slug 규칙은 `lib/mdx-tree.ts`와 동일하게 숫자 접두사를 포함한 파일명을 그대로 쓴다.
 */
async function buildValidPaths(dir: string = CONTENT_DIR, set = new Set<string>()): Promise<Set<string>> {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(CONTENT_DIR, full).split(path.sep).join('/');
    if (e.isDirectory()) {
      set.add(`/docs/${rel}`);
      await buildValidPaths(full, set);
    } else if (e.name.endsWith('.mdx')) {
      set.add(`/docs/${rel.slice(0, -4)}`);
    }
  }
  return set;
}

async function collectMDXFiles(dir: string = CONTENT_DIR): Promise<string[]> {
  const out: string[] = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await collectMDXFiles(full)));
    else if (e.name.endsWith('.mdx')) out.push(path.relative(CONTENT_DIR, full));
  }
  return out.sort();
}

/**
 * 한 파일에서 사이트 내부(`/docs/…`) 링크를 추출한다.
 * - 마크다운 링크 `](/docs/…)` 와 JSX `href="/docs/…"` 두 형태를 모두 잡는다.
 * - 앵커(`#…`)·쿼리(`?…`)·말미 슬래시는 떼고 경로만 검증한다(앵커 자체는 미검증).
 * - `](https://…/docs/…)` 같은 외부 URL은 슬래시 바로 뒤 `/docs/`가 아니므로 잡히지 않는다.
 */
function extractInternalLinks(raw: string): string[] {
  const links: string[] = [];
  const patterns = [/\]\((\/docs\/[^)\s]*)\)/g, /href=["'](\/docs\/[^"']*)["']/g];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw))) {
      const target = m[1].split('#')[0].split('?')[0].replace(/\/$/, '');
      if (target) links.push(target);
    }
  }
  return links;
}

const valid = await buildValidPaths();
const files = await collectMDXFiles();

describe('MDX 내부 링크 유효성', () => {
  test('유효 doc 경로가 수집되어야 한다', () => {
    expect(valid.size).toBeGreaterThan(0);
  });

  test.each(files)('끊긴 /docs 링크 없음: %s', async (rel) => {
    const raw = await fs.readFile(path.join(CONTENT_DIR, rel), 'utf-8');
    const broken = [...new Set(extractInternalLinks(raw))].filter((t) => !valid.has(t));
    expect(broken, `끊긴 내부 링크 (${rel}):\n${broken.join('\n')}`).toEqual([]);
  });
});
