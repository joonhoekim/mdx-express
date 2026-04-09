import { describe, test, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx-components';
import { mdxOptions } from '@/components/mdx-options';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * content/ 하위의 모든 .mdx 파일 경로를 재귀적으로 수집한다.
 * 반환값은 CONTENT_DIR 기준 상대 경로 (예: "dev/react/hooks.mdx")
 */
async function collectMDXFiles(dir: string = CONTENT_DIR): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMDXFiles(fullPath)));
    } else if (entry.name.endsWith('.mdx')) {
      files.push(path.relative(CONTENT_DIR, fullPath));
    }
  }

  return files.sort();
}

/**
 * CodeBlock 컴포넌트 내부의 <>{} 를 HTML 엔티티로 이스케이프.
 * lib/mdx-file.ts의 sanitizeMDXContent와 동일한 로직.
 */
function sanitize(content: string): string {
  return content.replace(
    /<CodeBlock[^>]*>([\s\S]*?)<\/CodeBlock>/g,
    (match, codeContent) => {
      const escaped = codeContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\{/g, '&#123;')
        .replace(/\}/g, '&#125;');
      return match.replace(codeContent, escaped);
    },
  );
}

const mdxFiles = await collectMDXFiles();

describe('MDX 컴파일', () => {
  test('content/ 디렉토리에 MDX 파일이 존재해야 한다', () => {
    expect(mdxFiles.length).toBeGreaterThan(0);
  });

  test.each(mdxFiles)('컴파일 성공: %s', async (relativePath) => {
    const fullPath = path.join(CONTENT_DIR, relativePath);
    const raw = await fs.readFile(fullPath, 'utf-8');
    const { content } = matter(raw);
    const sanitized = sanitize(content);

    await expect(
      compileMDX({
        source: sanitized,
        components: mdxComponents,
        options: { blockJS: false, ...mdxOptions },
      }),
    ).resolves.toBeDefined();
  });
});
