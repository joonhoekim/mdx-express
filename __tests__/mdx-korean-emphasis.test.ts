import { describe, test, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { mdxOptions } from '@/components/mdx-options';

/**
 * 한글 본문에서 언더스코어 이탤릭(`_텍스트_`)이 깨지는 케이스를 잡는다.
 *
 * 왜 필요한가: CommonMark의 intraword-underscore 규칙상 `_`는 글자에 붙으면
 * 강조를 열거나 닫지 못한다. 한글 음절은 유니코드 letter라서 조사가 바로 붙는
 * `_배경_으로`, `여기_텍스트_저기` 같은 표기는 강조로 인식되지 않고 `_`가 그대로
 * 출력된다. `remark-cjk-friendly`는 `*`/`**`만 보정하고 `_`는 보정하지 않으므로
 * 컴파일 테스트(`compileMDX`)는 통과한다 — 즉 이 공백은 별도 검증이 필요하다.
 *
 * 해결책은 한글 강조에 `*텍스트*`(별표)를 쓰는 것. 이 테스트는 author가 강조를
 * 의도했지만 `_`가 글자에 막혀 리터럴로 새어 나온 경우만 골라낸다.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content');

/** 프로덕션 remark 파이프라인(cjk-friendly·math·gfm 등)으로 mdast를 만든다. */
function parseToMdast(md: string) {
  const processor = unified().use(remarkParse);
  for (const plugin of mdxOptions.mdxOptions.remarkPlugins) {
    if (Array.isArray(plugin)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      processor.use(plugin[0] as any, plugin[1]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      processor.use(plugin as any);
    }
  }
  return processor.runSync(processor.parse(md));
}

const HANGUL = /[가-힣]/;
// `_` 바깥쪽이 공백/문장부호/경계면 author가 강조를 '의도'한 신호로 본다.
const OPEN_BOUNDARY = /[([{“"'‘「『]/;
const CLOSE_BOUNDARY = /[)\]}.,!?;:”"'’」』…]/;

/**
 * 한 text 노드 문자열에서 '깨진 한글 이탤릭'을 찾는다.
 *
 * 핵심 전제: 강조로 정상 변환됐다면 그 부분은 `emphasis` 노드가 되어 text 노드에
 * `_..._` 형태로 남지 않는다. 따라서 text 노드에 살아남은 `_..._`는 전부 리터럴이다.
 * 그중에서도 (1) 안에 한글이 있고 (2) 바깥쪽 경계가 강조 의도로 보이는 것만 고른다.
 * — `진짜_마지막_fix`(양쪽 글자에 낀 의도적 리터럴), `snake_case`(한글 없음)는 제외된다.
 */
function findBrokenEmphasis(str: string): string[] {
  const hits: string[] = [];
  const re = /_([^_\n]+)_/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(str))) {
    if (!HANGUL.test(m[1])) continue;
    const i = m.index;
    const before = i === 0 ? '' : str[i - 1];
    const after = i + m[0].length >= str.length ? '' : str[i + m[0].length];
    const openIntent = before === '' || /\s/.test(before) || OPEN_BOUNDARY.test(before);
    const closeIntent = after === '' || /\s/.test(after) || CLOSE_BOUNDARY.test(after);
    if (openIntent || closeIntent) hits.push(m[0]);
  }
  return hits;
}

/** 본문(frontmatter 제외)을 파싱해 깨진 이탤릭 목록을 `라인:스니펫`으로 반환한다. */
function collectBrokenEmphasis(raw: string): string[] {
  const body = matter(raw).content;
  const tree = parseToMdast(body);
  const found: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visit(tree, 'text', (node: any) => {
    const line = node.position?.start?.line ?? '?';
    for (const hit of findBrokenEmphasis(node.value)) {
      found.push(`L${line}: ${hit}`);
    }
  });
  return found;
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

describe('한글 언더스코어 이탤릭 깨짐 탐지', () => {
  test('조사가 붙은 _배경_으로 는 깨진 강조로 잡힌다', () => {
    expect(collectBrokenEmphasis('현금흐름을 _배경_으로 깔았다면')).toHaveLength(1);
  });

  test('별표 *배경*으로 는 정상 변환되어 잡히지 않는다', () => {
    expect(collectBrokenEmphasis('현금흐름을 *배경*으로 깔았다면')).toEqual([]);
  });

  test('양쪽 공백 _느껴져도_ 는 정상 변환되어 잡히지 않는다', () => {
    expect(collectBrokenEmphasis('관점은 어리게 _느껴져도_ 실제로')).toEqual([]);
  });

  test('한쪽이 경계인 _텍스트_입니다 (조사가 닫는 _를 막음) 는 잡힌다', () => {
    expect(collectBrokenEmphasis('_텍스트_입니다')).toHaveLength(1);
  });

  test('양쪽이 글자에 낀 여기_텍스트_저기 는 의도적 리터럴과 구별 불가라 잡지 않는다', () => {
    // 바깥쪽에 공백/문장부호 경계가 없으면 강조 의도인지 `진짜_마지막_fix`류
    // 리터럴인지 구분할 수 없으므로, 오탐을 피하려 일부러 통과시킨다.
    expect(collectBrokenEmphasis('여기_텍스트_저기')).toEqual([]);
  });

  test('글자에 낀 의도적 리터럴 "진짜_마지막_fix" 는 잡지 않는다', () => {
    expect(collectBrokenEmphasis('커밋 메시지: "진짜_마지막_fix"')).toEqual([]);
  });

  test('한글 없는 snake_case 는 잡지 않는다', () => {
    expect(collectBrokenEmphasis('변수 my_table_name 을 참조')).toEqual([]);
  });

  test('인라인 코드 안의 `_배경_으로` 는 잡지 않는다', () => {
    expect(collectBrokenEmphasis('코드 `_배경_으로` 예시')).toEqual([]);
  });
});

const files = await collectMDXFiles();

describe('content/ 전체 한글 이탤릭 검증', () => {
  test.each(files)('깨진 한글 이탤릭 없음: %s', async (rel) => {
    const raw = await fs.readFile(path.join(CONTENT_DIR, rel), 'utf-8');
    const broken = collectBrokenEmphasis(raw);
    expect(
      broken,
      `한글 이탤릭은 _ 대신 *별표*를 쓰세요 (${rel}):\n${broken.join('\n')}`,
    ).toEqual([]);
  });
});
