import { describe, test, expect } from 'vitest';
import { lintFile, ALLOWED_KEYS } from '@/scripts/mdx-lint-core.mjs';

const ruleSet = (arr: { rule: string }[]) => arr.map(d => d.rule);

describe('lintFile — error 규칙', () => {
  test('frontmatter 없으면 no-frontmatter error', () => {
    const { errors } = lintFile('# 제목\n\n본문', 'a.mdx');
    expect(ruleSet(errors)).toContain('no-frontmatter');
  });

  test('본문 H1이 있으면 no-body-h1 error (라인 번호 포함)', () => {
    const raw = '---\ntitle: "T"\n---\n\n## 섹션\n\n# 잘못된 H1\n';
    const { errors } = lintFile(raw, 'a.mdx');
    const h1 = errors.find(e => e.rule === 'no-body-h1');
    expect(h1).toBeDefined();
    expect(h1!.line).toBe(7);
  });

  test('코드펜스 안의 # 는 H1로 보지 않음', () => {
    const raw = '---\ntitle: "T"\n---\n\n```py\n# comment\n```\n';
    const { errors } = lintFile(raw, 'a.mdx');
    expect(ruleSet(errors)).not.toContain('no-body-h1');
  });

  test('화이트리스트 외 키는 unknown-key error', () => {
    const raw = '---\ntitle: "T"\nauthor: "me"\n---\n\n본문';
    const { errors } = lintFile(raw, 'a.mdx');
    expect(errors.some(e => e.rule === 'unknown-key' && e.msg.includes('author'))).toBe(true);
  });

  test('order 타입 오류는 invalid-type error', () => {
    const raw = '---\ntitle: "T"\norder: "1"\n---\n\n본문';
    const { errors } = lintFile(raw, 'a.mdx');
    expect(ruleSet(errors)).toContain('invalid-type');
  });

  test('규칙을 다 지키면 error 없음', () => {
    const raw = '---\ntitle: "T"\ndescription: "d"\norder: 1\n---\n\n## 본문\n';
    const { errors } = lintFile(raw, 'a.mdx');
    expect(errors).toEqual([]);
  });

  test('ALLOWED_KEYS는 5개 키', () => {
    expect(ALLOWED_KEYS).toEqual(['title', 'subtitle', 'description', 'order', 'tags']);
  });
});

describe('lintFile — warning 규칙', () => {
  test('description 없으면 no-description warning', () => {
    const raw = '---\ntitle: "T"\norder: 1\n---\n\n## 본문';
    const { warnings } = lintFile(raw, 'a.mdx');
    expect(warnings.map(w => w.rule)).toContain('no-description');
  });

  test('order 없으면 no-order warning', () => {
    const raw = '---\ntitle: "T"\ndescription: "d"\n---\n\n## 본문';
    const { warnings } = lintFile(raw, 'a.mdx');
    expect(warnings.map(w => w.rule)).toContain('no-order');
  });

  test('subtitle 없고 첫 본문 줄이 이탤릭 인용이면 subtitle-candidate warning', () => {
    const raw = '---\ntitle: "T"\ndescription: "d"\norder: 1\n---\n\n*"한 줄 인용"*\n\n## 본문';
    const { warnings } = lintFile(raw, 'a.mdx');
    const c = warnings.find(w => w.rule === 'subtitle-candidate');
    expect(c).toBeDefined();
    expect(c!.line).toBe(7);
  });

  test('subtitle 있으면 subtitle-candidate 안 뜸', () => {
    const raw = '---\ntitle: "T"\nsubtitle: "s"\ndescription: "d"\norder: 1\n---\n\n*"인용"*\n';
    const { warnings } = lintFile(raw, 'a.mdx');
    expect(warnings.map(w => w.rule)).not.toContain('subtitle-candidate');
  });
});
