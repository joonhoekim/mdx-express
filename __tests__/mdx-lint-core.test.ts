import { describe, test, expect } from 'vitest';
import { lintFile, fixFile, ALLOWED_KEYS } from '@/scripts/mdx-lint-core';
import matter from 'gray-matter';

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

  test('<CodeBlock> 안의 # 는 H1로 보지 않음', () => {
    const raw = '---\ntitle: "T"\n---\n\n<CodeBlock language="bash">\n# 주석\nsed -n p\n</CodeBlock>\n';
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

  test('order 없어도 warning 아님 (파일명 정렬 컨벤션)', () => {
    const raw = '---\ntitle: "T"\ndescription: "d"\n---\n\n## 본문';
    const { warnings } = lintFile(raw, 'a.mdx');
    expect(warnings.map(w => w.rule)).not.toContain('no-order');
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

describe('fixFile — 자동수정', () => {
  test('frontmatter 없고 H1 + 이탤릭 인용 → title/subtitle 생성, 본문에서 제거', () => {
    const raw = '# 라이브 코딩 — "제 로컬에선 됐는데요"\n\n*"손이 떨림"*\n\n## 본문\n';
    const { content, changed, applied } = fixFile(raw, 'a.mdx');
    expect(changed).toBe(true);
    expect(applied).toContain('title');
    expect(applied).toContain('subtitle');
    const { data } = matter(content);
    expect(data.title).toBe('라이브 코딩 — "제 로컬에선 됐는데요"');
    expect(data.subtitle).toBe('손이 떨림');
    expect(content).not.toMatch(/^# /m);        // 본문 H1 제거됨
    expect(content).toContain('## 본문');
  });

  test('order 문자열 → number 변환', () => {
    const raw = '---\ntitle: "T"\norder: "3"\n---\n\n## 본문\n';
    const { content, applied } = fixFile(raw, 'a.mdx');
    expect(applied).toContain('order-type');
    expect(matter(content).data.order).toBe(3);
  });

  test('이미 규칙 준수면 changed=false', () => {
    const raw = '---\ntitle: "T"\ndescription: "d"\norder: 1\n---\n\n## 본문\n';
    const { changed } = fixFile(raw, 'a.mdx');
    expect(changed).toBe(false);
  });

  test('멱등성 — fix 두 번 돌려도 결과 동일', () => {
    const raw = '# 제목\n\n*"부제"*\n\n## 본문\n';
    const once = fixFile(raw, 'a.mdx').content;
    const twice = fixFile(once, 'a.mdx').content;
    expect(twice).toBe(once);
  });

  test('fix 결과는 lint error 0', () => {
    const raw = '# 제목\n\n## 본문\n';
    const fixed = fixFile(raw, 'a.mdx').content;
    expect(lintFile(fixed, 'a.mdx').errors).toEqual([]);
  });

  test('본문이 수평선(---)으로 시작해도 char 분해 없이 안전하게 fix', () => {
    const raw = '# 제목\n\n*"부제"*\n\n---\n\n본문 단락\n';
    const { content } = fixFile(raw, 'a.mdx');
    const { data } = matter(content);
    expect(data.title).toBe('제목');
    expect(data.subtitle).toBe('부제');
    expect(Object.keys(data)).toEqual(['title', 'subtitle']); // '0','1'... char 키 없음
    expect(content).toContain('본문 단락');
  });

  test('부분 인용 *"A" — B* 는 별표만 제거하고 따옴표 대칭 보존', () => {
    const raw = '# 제목\n\n*"인용 ㅋㅋ" — 부연 설명*\n\n## 본문\n';
    const { content } = fixFile(raw, 'a.mdx');
    expect(matter(content).data.subtitle).toBe('"인용 ㅋㅋ" — 부연 설명');
  });
});
