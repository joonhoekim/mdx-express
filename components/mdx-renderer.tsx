import type { ReactNode } from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';
import 'katex/dist/katex.min.css';

import { mdxComponents } from './mdx-components';
import { createMdxOptions, type TocHeading } from './mdx-options';
import { formatMDXError, MDXErrorDisplay } from './mdx-error';

const isDev = process.env.NODE_ENV === 'development';

interface CompiledDocument {
  /** 렌더링된 MDX 본문 노드 */
  node: ReactNode;
  /** 본문에서 추출한 h2~h3 헤딩 목록 (목차용) */
  headings: TocHeading[];
}

const PROSE_CLASS =
  'mdx-content prose prose-slate dark:prose-invert max-w-none prose-lg prose-headings:font-display prose-pre:bg-slate-50 dark:prose-pre:bg-slate-800 prose-code:text-blue-600 dark:prose-code:text-blue-400 text-[16.5px]';

/**
 * MDX를 컴파일해 렌더 노드와 목차용 헤딩 목록을 함께 반환한다.
 * compileMDX는 VFile을 노출하지 않으므로, 헤딩은 rehype 플러그인의
 * 클로저 배열(createMdxOptions의 collectInto)로 수집한다.
 */
export async function compileDocument(content: string): Promise<CompiledDocument> {
  const headings: TocHeading[] = [];

  try {
    const { content: compiled } = await compileMDX({
      source: content,
      components: mdxComponents,
      options: { blockJS: false, ...createMdxOptions(headings) },
    });

    return {
      node: <div className={PROSE_CLASS}>{compiled}</div>,
      headings,
    };
  } catch (error) {
    const formatted = formatMDXError(error, content);
    console.error(formatted);

    if (isDev) return { node: <MDXErrorDisplay message={formatted} />, headings: [] };

    throw error;
  }
}

interface MDXRendererProps {
  content: string;
}

/** MDX 본문만 렌더링한다 (목차가 필요 없는 곳용). */
export async function MDXRenderer({ content }: MDXRendererProps) {
  const { node } = await compileDocument(content);
  return node;
}
