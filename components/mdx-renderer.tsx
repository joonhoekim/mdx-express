import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MDXRemote } from 'next-mdx-remote/rsc';
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

export function MDXRenderer({ content }: MDXRendererProps) {
  // MDX 컴포넌트 맵핑
  const components = {
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

  return (
    <div className="mdx-content prose prose-slate dark:prose-invert max-w-none prose-lg prose-headings:font-display prose-pre:bg-slate-50 dark:prose-pre:bg-slate-800 prose-code:text-blue-600 dark:prose-code:text-blue-400 text-[16.5px]">
      <MDXRemote
        source={content}
        components={components}
        options={{
          blockJS: false,
          mdxOptions: {
            remarkPlugins: [remarkCjkFriendly, remarkMath, remarkGfm],
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
            ],
            development: false,
            format: 'mdx',
          },
        }}
      />
    </div>
  );
} 