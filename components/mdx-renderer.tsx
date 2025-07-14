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
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4" {...props} />
    ),
    h2: (props: any) => (
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-4" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3" {...props} />
    ),
    h4: (props: any) => (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2" {...props} />
    ),
    p: (props: any) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
    ),
    ul: (props: any) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
    ),
    ol: (props: any) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
    ),
    li: (props: any) => (
      <li className="mt-2" {...props} />
    ),
    blockquote: (props: any) => (
      <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
    ),
    code: (props: any) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props} />
    ),
    pre: (props: any) => (
      <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm" {...props} />
    ),
    a: (props: any) => (
      <a className="font-medium text-primary underline underline-offset-4" {...props} />
    ),
    hr: (props: any) => (
      <hr className="my-4 md:my-8" {...props} />
    ),
    table: (props: any) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full" {...props} />
      </div>
    ),
    thead: (props: any) => (
      <thead className="border-b" {...props} />
    ),
    tbody: (props: any) => (
      <tbody className="[&_tr:last-child]:border-0" {...props} />
    ),
    tr: (props: any) => (
      <tr className="m-0 border-t p-0 even:bg-muted" {...props} />
    ),
    th: (props: any) => (
      <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
    ),
    td: (props: any) => (
      <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
    ),
  };

  return (
    <div className="mdx-content prose prose-slate dark:prose-invert max-w-none">
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