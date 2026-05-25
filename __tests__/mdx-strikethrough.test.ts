import { describe, test, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { mdxOptions } from '@/components/mdx-options';

/**
 * 프로덕션의 remark 파이프라인을 그대로 적용한 processor.
 * mdast → hast → HTML 문자열까지 변환해서 검증한다.
 */
function makeProcessor() {
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
  return processor
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });
}

async function renderToHtml(md: string): Promise<string> {
  const file = await makeProcessor().process(md);
  return String(file);
}

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
  const parsed = processor.parse(md);
  return processor.runSync(parsed);
}

function hasDeleteNode(tree: ReturnType<typeof parseToMdast>): boolean {
  let found = false;
  visit(tree, 'delete', () => {
    found = true;
  });
  return found;
}

describe('취소선 비활성화', () => {
  test('이중 틸드 ~~text~~ 가 취소선으로 변환되지 않는다', async () => {
    const html = await renderToHtml('이 글은 ~~취소선~~ 을 포함한다.');
    expect(html).not.toContain('<del>');
    expect(html).toContain('~~취소선~~');
  });

  test('이중 틸드를 포함한 mdast에 delete 노드가 없다', () => {
    const tree = parseToMdast('이 글은 ~~취소선~~ 을 포함한다.');
    expect(hasDeleteNode(tree)).toBe(false);
  });

  test('숫자 범위 표기 2024~2025 가 보존된다', async () => {
    const html = await renderToHtml('기간은 2024~2025 입니다.');
    expect(html).not.toContain('<del>');
    expect(html).toContain('2024~2025');
  });

  test('한글 감탄 단일 틸드 ~안녕~ 이 보존된다', async () => {
    const html = await renderToHtml('인사: ~안녕~ 잘가~');
    expect(html).not.toContain('<del>');
    expect(html).toContain('~안녕~');
  });

  test('퍼센트 범위 10~20% 가 보존된다', async () => {
    const html = await renderToHtml('범위는 10~20% 정도.');
    expect(html).not.toContain('<del>');
    expect(html).toContain('10~20%');
  });

  test('한 단락 내 다중 틸드도 텍스트로 남는다', async () => {
    const html = await renderToHtml('약 100~200원 ~~할인~~ ~중고~ 가격');
    expect(html).not.toContain('<del>');
    expect(html).toContain('100~200');
    expect(html).toContain('~~할인~~');
    expect(html).toContain('~중고~');
  });
});
