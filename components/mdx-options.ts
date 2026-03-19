import remarkGfm from 'remark-gfm';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

const isDev = process.env.NODE_ENV === 'development';

/** rehype-raw가 보존해야 할 MDX 노드 타입 (없으면 import/JSX 깨짐) */
const MDX_PASS_THROUGH_NODES = [
  'mdxFlowExpression',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxTextExpression',
  'mdxjsEsm',
] as const;

/** MDX 컴파일 옵션 (remark/rehype 플러그인 + 포맷 설정) */
export const mdxOptions = {
  mdxOptions: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- remark 플러그인 타입이 PluggableList와 불일치
    remarkPlugins: [remarkCjkFriendly, remarkMath, remarkGfm] as any[],
    rehypePlugins: [
      [rehypeKatex, { strict: false }],
      [rehypeRaw, { passThrough: [...MDX_PASS_THROUGH_NODES] }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- rehype 플러그인 옵션 튜플 타입 불일치
    ] as any[],
    development: isDev,
    format: 'mdx' as const,
  },
};
