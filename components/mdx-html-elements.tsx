import { type ComponentProps, type ReactElement } from 'react';
import { CodeBlock, Mermaid } from '@/components/writing-ui';

type P<T extends keyof React.JSX.IntrinsicElements> = ComponentProps<T>;

/** pre > code 구조에서 code 요소의 props */
interface CodeChildProps {
  className?: string;
  children?: React.ReactNode;
}

/** pre.children이 ReactElement<CodeChildProps>인지 확인 */
function getCodeChild(preProps: P<'pre'>): CodeChildProps | null {
  const child = preProps.children;
  if (child && typeof child === 'object' && 'props' in (child as ReactElement)) {
    return (child as ReactElement<CodeChildProps>).props;
  }
  return null;
}

export const mdxHtmlElements = {
  h1: (props: P<'h1'>) => (
    <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mt-8 mb-8 first:mt-0 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent" {...props} />
  ),
  h2: (props: P<'h2'>) => (
    <h2 className="scroll-m-20 border-b-2 pb-3 text-3xl font-semibold tracking-tight mt-12 mb-6 first:mt-0 border-slate-200 dark:border-slate-700 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500" {...props} />
  ),
  h3: (props: P<'h3'>) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-10 mb-5 text-slate-800 dark:text-slate-200" {...props} />
  ),
  h4: (props: P<'h4'>) => (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-4 text-slate-700 dark:text-slate-300" {...props} />
  ),
  h5: (props: P<'h5'>) => (
    <h5 className="scroll-m-20 text-lg font-semibold tracking-tight mt-6 mb-3 text-slate-600 dark:text-slate-400" {...props} />
  ),
  h6: (props: P<'h6'>) => (
    <h6 className="scroll-m-20 text-base font-semibold tracking-tight mt-6 mb-3 text-slate-600 dark:text-slate-400" {...props} />
  ),
  p: (props: P<'p'>) => (
    <p className="leading-[1.8] text-slate-700 dark:text-slate-300 [&:not(:first-child)]:mt-3 mb-3" {...props} />
  ),
  ul: (props: P<'ul'>) => (
    <ul className="my-4 ml-4 list-disc space-y-3 [&>li]:mt-2 marker:text-blue-500 dark:marker:text-blue-400" {...props} />
  ),
  ol: (props: P<'ol'>) => (
    <ol className="my-4 ml-4 list-decimal space-y-3 [&>li]:mt-2 marker:text-blue-500 dark:marker:text-blue-400 marker:font-semibold" {...props} />
  ),
  li: (props: P<'li'>) => (
    <li className="mt-2 leading-[1.75] text-slate-700 dark:text-slate-300" {...props} />
  ),
  blockquote: (props: P<'blockquote'>) => (
    <blockquote className="my-8 border-l-4 border-l-transparent bg-slate-50 dark:bg-slate-800/50 pl-6 pr-4 py-4 italic rounded-r-lg shadow-sm [border-image:linear-gradient(to_bottom,#3b82f6,#8b5cf6)_1]" {...props} />
  ),
  code: (props: P<'code'>) => (
    <code className="relative rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 before:content-none after:content-none" {...props} />
  ),
  pre: (props: P<'pre'>) => {
    const codeChild = getCodeChild(props);
    const childClassName = codeChild?.className ?? '';

    // Mermaid 다이어그램인 경우
    if (childClassName.includes('language-mermaid')) {
      return <Mermaid>{codeChild!.children as string}</Mermaid>;
    }

    // math 블록은 rehype-katex가 처리하도록 패스스루
    if (childClassName.includes('math-display')) {
      return <pre {...props} />;
    }

    // 코드 블록인 경우 writing-ui CodeBlock 컴포넌트 사용
    if (childClassName.includes('language-')) {
      const language = childClassName.replace('language-', '');
      return (
        <CodeBlock language={language}>
          {codeChild!.children}
        </CodeBlock>
      );
    }

    // 언어 미지정 코드 블록도 CodeBlock으로 통일
    // MDX 컴포넌트 오버라이드로 인해 type이 'code' 문자열이 아닌 함수일 수 있으므로
    // children의 props 존재 여부로 판별
    if (codeChild?.children != null) {
      return (
        <CodeBlock language="plaintext">
          {codeChild.children}
        </CodeBlock>
      );
    }

    return <pre {...props} />;
  },
  a: (props: P<'a'>) => (
    <a className="font-medium text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors decoration-blue-300 dark:decoration-blue-600 hover:decoration-blue-600 dark:hover:decoration-blue-400" {...props} />
  ),
  hr: (props: P<'hr'>) => (
    <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" {...props} />
  ),
  table: (props: P<'table'>) => (
    <div className="my-8 w-full overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <table className="w-full" {...props} />
    </div>
  ),
  thead: (props: P<'thead'>) => (
    <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" {...props} />
  ),
  tbody: (props: P<'tbody'>) => (
    <tbody className="[&_tr:last-child]:border-0 divide-y divide-slate-100 dark:divide-slate-700" {...props} />
  ),
  tr: (props: P<'tr'>) => (
    <tr className="m-0 p-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors" {...props} />
  ),
  th: (props: P<'th'>) => (
    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
  ),
  td: (props: P<'td'>) => (
    <td className="px-6 py-4 text-left text-slate-700 dark:text-slate-300 [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
  ),
};
