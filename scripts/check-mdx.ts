#!/usr/bin/env bun
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { lintFile, fixFile } from './mdx-lint-core';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const args = process.argv.slice(2);
const doFix = args.includes('--fix');
const stagedOnly = args.includes('--staged');

/** content/ 하위 .mdx 상대경로 재귀 수집 */
function collectMDX(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectMDX(full));
    else if (entry.name.endsWith('.mdx')) out.push(path.relative(process.cwd(), full));
  }
  return out.sort();
}

let files: string[];
if (stagedOnly) {
  // execFileSync: shell을 거치지 않아 injection 위험 없음 (인자 배열 고정)
  const staged = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], { encoding: 'utf8' });
  files = staged.split('\n').filter(f => f.endsWith('.mdx') && fs.existsSync(f));
} else {
  files = collectMDX(CONTENT_DIR);
}

if (files.length === 0) {
  console.log('[check-mdx] 검사할 .mdx 파일이 없음.');
  process.exit(0);
}

let totalErrors = 0, totalWarnings = 0, fixedCount = 0;

for (const rel of files) {
  const raw = fs.readFileSync(rel, 'utf8');

  if (doFix) {
    const { content, changed, applied } = fixFile(raw, rel);
    if (changed) {
      fs.writeFileSync(rel, content, 'utf8');
      fixedCount++;
      console.log(`[fixed] ${rel} - ${applied.join(', ')}`);
    }
  }

  // fix 후의 내용으로 다시 lint (남은 위반 리포트)
  const current = doFix ? fs.readFileSync(rel, 'utf8') : raw;
  const { errors, warnings } = lintFile(current, rel);
  for (const e of errors) {
    console.error(`[error] ${rel}:${e.line} - ${e.msg}`);
    totalErrors++;
  }
  for (const w of warnings) {
    console.warn(`[warn]  ${rel} - ${w.msg}`);
    totalWarnings++;
  }
}

const fixInfo = doFix ? `${fixedCount} fixed, ` : '';
console.log(`[summary] ${files.length} files checked, ${fixInfo}${totalErrors} errors, ${totalWarnings} warnings`);
process.exit(totalErrors > 0 ? 1 : 0);
