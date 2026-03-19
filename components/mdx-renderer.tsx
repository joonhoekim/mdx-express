import { compileMDX } from 'next-mdx-remote/rsc';
import 'katex/dist/katex.min.css';

import { mdxComponents } from './mdx-components';
import { mdxOptions } from './mdx-options';
import { formatMDXError, MDXErrorDisplay } from './mdx-error';

interface MDXRendererProps {
  content: string;
}

const isDev = process.env.NODE_ENV === 'development';

export async function MDXRenderer({ content }: MDXRendererProps) {
  try {
    const { content: compiled } = await compileMDX({
      source: content,
      components: mdxComponents,
      options: { blockJS: false, ...mdxOptions },
    });

    return (
      <div className="mdx-content prose prose-slate dark:prose-invert max-w-none prose-lg prose-headings:font-display prose-pre:bg-slate-50 dark:prose-pre:bg-slate-800 prose-code:text-blue-600 dark:prose-code:text-blue-400 text-[16.5px]">
        {compiled}
      </div>
    );
  } catch (error) {
    const formatted = formatMDXError(error, content);
    console.error(formatted);

    if (isDev) return <MDXErrorDisplay message={formatted} />;

    throw error;
  }
}
