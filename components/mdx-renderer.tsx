import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

// Writing UI 컴포넌트들 import
import {
  Callout,
  CodeBlock,
  Mermaid,
  Steps,
  Step,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card as WritingCard,
  Blockquote,
  Badge as WritingBadge,
  Reference,
  ReferenceList,
  Icon,
  MathCodeBridge,
  MugongCard
} from '@/components/writing-ui';
import { mdxHtmlElements } from './mdx-html-elements';

interface MDXRendererProps {
  content: string;
}

const isDev = process.env.NODE_ENV === 'development';

const mdxComponents = {
  // Writing UI 컴포넌트들
  Callout,
  CodeBlock,
  Mermaid,
  Steps,
  Step,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card: WritingCard,
  Blockquote,
  Badge: WritingBadge,
  Reference,
  ReferenceList,
  Icon,
  MathCodeBridge,
  MugongCard,

  // Shadcn UI 컴포넌트들
  Button,
  ShadcnCard: Card,
  CardContent,
  CardHeader,
  CardTitle,
  ShadcnBadge: Badge,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,

  // HTML 기본 요소들 스타일링
  ...mdxHtmlElements,
};

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkCjkFriendly, remarkMath, remarkGfm] as any[],
    rehypePlugins: [
      [rehypeKatex, { strict: false }],
      [rehypeRaw, {
        passThrough: [
          'mdxFlowExpression',
          'mdxJsxFlowElement',
          'mdxJsxTextElement',
          'mdxTextExpression',
          'mdxjsEsm'
        ]
      }]
    ] as any[],
    development: isDev,
    format: 'mdx' as const,
  },
};

function formatMDXError(error: unknown, source: string): string {
  const err = error as Error & { line?: number; column?: number; position?: { start?: { line?: number; column?: number } } };
  const name = err.name || 'Error';
  const message = err.message || String(error);

  // MDX/unified 에러에서 위치 정보 추출
  const line = err.line || err.position?.start?.line;
  const column = err.column || err.position?.start?.column;

  const parts: string[] = [`[MDX ${name}] ${message}`];

  if (line) {
    parts.push(`  → 위치: ${line}줄${column ? `, ${column}열` : ''}`);
    // 에러 주변 소스 코드 표시
    const lines = source.split('\n');
    const start = Math.max(0, line - 3);
    const end = Math.min(lines.length, line + 2);
    parts.push('  ─── 소스 ───');
    for (let i = start; i < end; i++) {
      const marker = i === line - 1 ? '▶' : ' ';
      parts.push(`  ${marker} ${String(i + 1).padStart(4)} │ ${lines[i]}`);
    }
    parts.push('  ────────────');
  }

  return parts.join('\n');
}

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

    if (isDev) {
      return (
        <div className="p-6 my-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
          <h2 className="text-red-700 dark:text-red-400 font-bold text-lg mb-2">MDX 렌더링 오류</h2>
          <pre className="text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap overflow-x-auto">{formatted}</pre>
        </div>
      );
    }

    throw error;
  }
} 