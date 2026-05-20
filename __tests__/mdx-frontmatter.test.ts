import { describe, test, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { lintFile } from '@/scripts/mdx-lint-core.mjs';

const CONTENT_DIR = path.join(process.cwd(), 'content');

async function collect(dir: string = CONTENT_DIR): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await collect(full)));
    else if (e.name.endsWith('.mdx')) files.push(path.relative(CONTENT_DIR, full));
  }
  return files.sort();
}

const files = await collect();

describe('MDX frontmatter 규칙', () => {
  test.each(files)('error 0: %s', async (rel) => {
    const raw = await fs.readFile(path.join(CONTENT_DIR, rel), 'utf-8');
    const { errors } = lintFile(raw, rel);
    expect(errors, errors.map(e => `${rel}:${e.line} ${e.msg}`).join('\n')).toEqual([]);
  });
});
