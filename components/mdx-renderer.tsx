import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

// Writing UI 컴포넌트들 import
import {
  Callout,
  CodeBlock,
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
  ReferenceList
} from '@/components/writing-ui';

// Lucide 아이콘들 import
import { Star, Code, Palette, Zap, FileText, ArrowRight, Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface MDXRendererProps {
  content: string;
}

export function MDXRenderer({ content }: MDXRendererProps) {
  // MDX 컴포넌트 맵핑
  const components = {
    // Writing UI 컴포넌트들
    Callout,
    CodeBlock,
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

    // Lucide 아이콘들
    Star,
    Code,
    Palette,
    Zap,
    FileText,
    ArrowRight,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Lightbulb,

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
    h1: (props: any) => (
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-12 mb-8 first:mt-0 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent" {...props} />
    ),
    h2: (props: any) => (
      <h2 className="scroll-m-20 border-b-2 pb-4 text-3xl font-semibold tracking-tight mt-12 mb-6 first:mt-0 border-slate-200 dark:border-slate-700 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-10 mb-5 text-slate-800 dark:text-slate-200" {...props} />
    ),
    h4: (props: any) => (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-4 text-slate-700 dark:text-slate-300" {...props} />
    ),
    h5: (props: any) => (
      <h5 className="scroll-m-20 text-lg font-semibold tracking-tight mt-6 mb-3 text-slate-600 dark:text-slate-400" {...props} />
    ),
    h6: (props: any) => (
      <h6 className="scroll-m-20 text-base font-semibold tracking-tight mt-6 mb-3 text-slate-600 dark:text-slate-400" {...props} />
    ),
    p: (props: any) => (
      <p className="leading-8 text-slate-700 dark:text-slate-300 [&:not(:first-child)]:mt-3 mb-3" {...props} />
    ),
    ul: (props: any) => (
      <ul className="my-4 ml-4 list-disc space-y-3 [&>li]:mt-2 marker:text-blue-500 dark:marker:text-blue-400" {...props} />
    ),
    ol: (props: any) => (
      <ol className="my-4 ml-4 list-decimal space-y-3 [&>li]:mt-2 marker:text-blue-500 dark:marker:text-blue-400 marker:font-semibold" {...props} />
    ),
    li: (props: any) => (
      <li className="mt-2 leading-7 text-slate-700 dark:text-slate-300" {...props} />
    ),
    blockquote: (props: any) => (
      <blockquote className="my-8 border-l-4 border-blue-500/30 bg-slate-50 dark:bg-slate-800/50 pl-6 pr-4 py-4 italic rounded-r-lg shadow-sm" {...props} />
    ),
    code: (props: any) => (
      <code className="relative rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700" {...props} />
    ),
    pre: (props: any) => (
      <pre className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 font-mono text-sm my-8 shadow-sm" {...props} />
    ),
    a: (props: any) => (
      <a className="font-medium text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors decoration-blue-300 dark:decoration-blue-600 hover:decoration-blue-600 dark:hover:decoration-blue-400" {...props} />
    ),
    hr: (props: any) => (
      <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" {...props} />
    ),
    table: (props: any) => (
      <div className="my-8 w-full overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="w-full" {...props} />
      </div>
    ),
    thead: (props: any) => (
      <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" {...props} />
    ),
    tbody: (props: any) => (
      <tbody className="[&_tr:last-child]:border-0 divide-y divide-slate-100 dark:divide-slate-700" {...props} />
    ),
    tr: (props: any) => (
      <tr className="m-0 p-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors" {...props} />
    ),
    th: (props: any) => (
      <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-100 [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
    ),
    td: (props: any) => (
      <td className="px-6 py-4 text-left text-slate-700 dark:text-slate-300 [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
    ),
  };

  return (
    <div className="mdx-content prose prose-slate dark:prose-invert max-w-none prose-lg prose-headings:font-display prose-pre:bg-slate-50 dark:prose-pre:bg-slate-800 prose-code:text-blue-600 dark:prose-code:text-blue-400">
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  );
} 