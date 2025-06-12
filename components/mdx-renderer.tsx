"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ReactElement } from 'react';

interface MDXRendererProps {
  content: string;
}

export function MDXRenderer({ content }: MDXRendererProps) {
  // 임시로 단순한 마크다운 파싱을 구현
  // 나중에 더 정교한 MDX 파싱으로 교체할 수 있습니다
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: ReactElement[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-4">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="mt-6 border-l-2 pl-6 italic">
            {line.slice(2)}
          </blockquote>
        );
      } else if (line.startsWith('- ')) {
        // 간단한 리스트 항목
        elements.push(
          <ul key={i} className="my-6 ml-6 list-disc">
            <li className="mt-2">{line.slice(2)}</li>
          </ul>
        );
      } else if (line.trim() && !line.startsWith('---')) {
        // 일반 텍스트
        elements.push(
          <p key={i} className="leading-7 [&:not(:first-child)]:mt-6">
            {line}
          </p>
        );
      }
    }
    
    return elements;
  };

  return (
    <div className="mdx-content prose prose-slate dark:prose-invert max-w-none">
      {renderMarkdown(content)}
    </div>
  );
} 