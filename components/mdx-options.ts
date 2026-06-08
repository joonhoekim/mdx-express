import remarkGfm from 'remark-gfm';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { visit, SKIP } from 'unist-util-visit';

const isDev = process.env.NODE_ENV === 'development';

/** 목차(TOC) 항목 — h2~h3 헤딩만 수집한다 */
export interface TocHeading {
  depth: 2 | 3;
  id: string;
  text: string;
}

/** rehype-raw가 보존해야 할 MDX 노드 타입 (없으면 import/JSX 깨짐) */
const MDX_PASS_THROUGH_NODES = [
  'mdxFlowExpression',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxTextExpression',
  'mdxjsEsm',
] as const;

/**
 * GFM 취소선(`~text~`, `~~text~~`)을 비활성화한다.
 * 한글 본문에서 `~`는 숫자 범위("2024~2025")나 감탄("안녕~")으로 자주 쓰이므로
 * 의도치 않은 취소선 발생을 막는다. 실제 취소선이 필요하면 `<s>` HTML을 사용한다.
 *
 * remark-gfm 이후에 실행되어 mdast의 `delete` 노드를 원본 틸드 텍스트로 되돌린다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mdast 타입을 별도 의존성 없이 처리
function remarkNoStrikethrough(this: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any, file: any) => {
    const source = String(file?.value ?? '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'delete', (node: any, index: number | undefined, parent: any) => {
      if (!parent || index == null) return;
      let marker = '~~';
      const start = node.position?.start?.offset;
      const end = node.position?.end?.offset;
      if (typeof start === 'number' && typeof end === 'number') {
        const original = source.slice(start, end);
        const m = original.match(/^(~+)/);
        if (m) marker = m[1];
      }
      const replacement = [
        { type: 'text', value: marker },
        ...node.children,
        { type: 'text', value: marker },
      ];
      parent.children.splice(index, 1, ...replacement);
      return [SKIP, index + replacement.length];
    });
  };
}

/**
 * hast 노드의 텍스트만 재귀적으로 이어 붙인다 (헤딩 라벨 추출용).
 * 별도 의존성(hast-util-to-string) 없이 처리한다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hastText(node: any): string {
  if (node.type === 'text') return node.value ?? '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(hastText).join('');
}

/**
 * h2~h3 헤딩을 `acc` 배열로 수집하는 rehype 플러그인(attacher)을 만든다.
 * `rehypeSlug` 이후에 실행되어 id가 채워진 상태를 전제로 한다.
 *
 * unified 플러그인은 "attacher → transformer" 2단 구조이므로,
 * acc를 클로저로 잡은 attacher를 반환한다(transformer를 직접 넘기면
 * unified가 그것을 attacher로 호출해 tree가 undefined가 된다).
 */
function rehypeCollectHeadings(acc: TocHeading[]) {
  return function attacher() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (tree: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      visit(tree, 'element', (node: any) => {
        const depth = node.tagName === 'h2' ? 2 : node.tagName === 'h3' ? 3 : 0;
        const id = node.properties?.id;
        if (!depth || typeof id !== 'string') return;
        acc.push({ depth, id, text: hastText(node).trim() });
      });
    };
  };
}

/**
 * MDX 컴파일 옵션을 생성한다.
 * @param collectInto 전달하면 h2~h3 헤딩이 이 배열로 수집된다 (목차용)
 */
export function createMdxOptions(collectInto?: TocHeading[]) {
  const rehypePlugins: any[] = [
    [rehypeKatex, { strict: false }],
    [rehypeRaw, { passThrough: [...MDX_PASS_THROUGH_NODES] }],
    rehypeSlug,
  ];
  if (collectInto) rehypePlugins.push(rehypeCollectHeadings(collectInto));

  return {
    mdxOptions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- remark 플러그인 타입이 PluggableList와 불일치
      remarkPlugins: [
        remarkCjkFriendly,
        remarkMath,
        remarkGfm,
        remarkNoStrikethrough,
      ] as any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- rehype 플러그인 옵션 튜플 타입 불일치
      rehypePlugins: rehypePlugins as any[],
      development: isDev,
      format: 'mdx' as const,
    },
  };
}

/** MDX 컴파일 옵션 (remark/rehype 플러그인 + 포맷 설정) */
export const mdxOptions = createMdxOptions();
