// @vitest-environment jsdom
import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import mermaid from 'mermaid';
import {
  ensureMermaidInit,
  preprocessMermaidContent,
} from '@/components/writing-ui/mermaid-theme';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/** content/ 하위의 모든 .mdx 파일을 재귀 수집 (CONTENT_DIR 기준 상대 경로). */
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
 * 코드 펜스(``` ... ```) 중 info string이 mermaid인 블록의 본문을 추출한다.
 * `mdx-html-elements.tsx`의 pre 라우팅이 `language-mermaid`를 Mermaid 컴포넌트로
 * 넘기는 것과 동일한 대상(표준 mermaid 펜스)을 잡는다.
 */
function extractMermaidBlocks(raw: string): { content: string; line: number }[] {
  const blocks: { content: string; line: number }[] = [];
  const lines = raw.split('\n');
  let inBlock = false;
  let buf: string[] = [];
  let startLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inBlock) {
      // info string의 첫 단어가 정확히 "mermaid"인 펜스만 (```mermaid, ```mermaid title=...)
      const m = line.match(/^\s*```\s*mermaid(\s|$)/);
      if (m) {
        inBlock = true;
        buf = [];
        startLine = i + 1; // 1-based, 펜스 시작 줄
      }
      continue;
    }
    if (/^\s*```\s*$/.test(line)) {
      blocks.push({ content: buf.join('\n'), line: startLine });
      inBlock = false;
      continue;
    }
    buf.push(line);
  }
  return blocks;
}

const mdxFiles = await collectMDXFiles();

// (파일, 다이어그램) 단위로 펼친 케이스 목록
type Case = { file: string; index: number; line: number; content: string };
const cases: Case[] = [];
for (const file of mdxFiles) {
  const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8');
  extractMermaidBlocks(raw).forEach((b, i) =>
    cases.push({ file, index: i + 1, line: b.line, content: b.content }),
  );
}

describe('Mermaid 다이어그램 구문', () => {
  beforeAll(() => {
    // 프로덕션(`ensureMermaidInit`)과 동일한 init 설정으로 파싱한다.
    ensureMermaidInit(false);
  });

  test('content/ 에 mermaid 다이어그램이 존재해야 한다', () => {
    expect(cases.length).toBeGreaterThan(0);
  });

  test.each(cases.map((c) => [`${c.file} #${c.index} (L${c.line})`, c] as const))(
    '구문 유효: %s',
    async (_label, c) => {
      // 프로덕션 Mermaid 컴포넌트와 동일하게 전처리 후 파싱.
      const processed = preprocessMermaidContent(c.content.trim());
      await expect(
        mermaid.parse(processed),
        `mermaid 구문 오류 — ${c.file} 의 ${c.index}번째 다이어그램 (펜스 시작 L${c.line})`,
      ).resolves.toBeTruthy();
    },
  );
});
