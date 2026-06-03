import { describe, test, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { renderToStaticMarkup } from 'react-dom/server';
import { compileMDX } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx-components';
import { mdxOptions } from '@/components/mdx-options';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/** `__tests__/mdx-compile.test.ts`의 sanitize와 동일 (CodeBlock 내부 이스케이프). */
function sanitize(content: string): string {
  return content.replace(
    /<CodeBlock[^>]*>([\s\S]*?)<\/CodeBlock>/g,
    (match, codeContent) =>
      match.replace(
        codeContent,
        codeContent
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\{/g, '&#123;')
          .replace(/\}/g, '&#125;'),
      ),
  );
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

// KaTeX 오류는 `$` 없이는 발생하지 않으므로 후보 파일만 검사한다.
const allFiles = await collectMDXFiles();
const mathFiles: string[] = [];
for (const rel of allFiles) {
  const raw = await fs.readFile(path.join(CONTENT_DIR, rel), 'utf-8');
  if (raw.includes('$')) mathFiles.push(rel);
}

describe('KaTeX 수식 렌더링', () => {
  test('`$` 포함 파일이 존재해야 한다', () => {
    expect(mathFiles.length).toBeGreaterThan(0);
  });

  // compileMDX만으로는 KaTeX 파싱 오류가 안 잡힌다(rehype-katex가 throw 대신 빨간
  // .katex-error 노드를 렌더). 그래서 프로덕션과 동일한 파이프라인으로 SSR 렌더해
  // .katex-error 부재를 검증한다.
  //
  // 검증을 standalone remark/rehype 파이프라인으로 흉내내지 않고 compileMDX를 그대로 쓰는
  // 이유: 어떤 텍스트가 수식이 되는지는 remark-gfm(표)·@mdx-js 파서까지 얽혀 결정되므로,
  // 일부 플러그인만 뽑아 재현하면 오탐이 난다(예: GFM 표의 `$3 | $15` 셀, CodeBlock 템플릿
  // 리터럴). 통화 표기 `$50~$200`처럼 remark-math가 수식으로 오인하는 경우도 함께 잡힌다.
  test.each(mathFiles)('katex-error 없음: %s', async (rel) => {
    const raw = await fs.readFile(path.join(CONTENT_DIR, rel), 'utf-8');
    const { content } = await compileMDX({
      source: sanitize(matter(raw).content),
      components: mdxComponents,
      options: { blockJS: false, ...mdxOptions },
    });
    const html = renderToStaticMarkup(content);
    const titles = [...html.matchAll(/katex-error" title="([^"]+)"/g)].map((m) => m[1]);
    expect(titles, `KaTeX 렌더 오류 (${rel}):\n${titles.join('\n')}`).toEqual([]);
  });
});
