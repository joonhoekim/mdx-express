"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import mermaid from 'mermaid';

interface MermaidProps {
    children: string;
    className?: string;
    title?: string;
}

export function Mermaid({ children, className, title }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string>('');

    useEffect(() => {
        const renderDiagram = async () => {
            if (!ref.current) return;

            try {
                // Mermaid 초기화
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                });

                // 고유 ID 생성
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

                // 다이어그램 렌더링
                const { svg } = await mermaid.render(id, children.trim());
                setSvgContent(svg);
                setError(null);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
        };

        renderDiagram();
    }, [children]);

    if (error) {
        return (
            <div className={cn('rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 my-4', className)}>
                {title && (
                    <div className="font-medium text-red-900 dark:text-red-200 mb-2">
                        {title}
                    </div>
                )}
                <div className="text-sm text-red-800 dark:text-red-300">
                    Mermaid 렌더링 오류: {error}
                </div>
                <pre className="mt-2 text-xs text-red-700 dark:text-red-400 overflow-x-auto">
                    {children}
                </pre>
            </div>
        );
    }

    return (
        <div className={cn('rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 my-6', className)}>
            {title && (
                <div className="font-medium text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                    {title}
                </div>
            )}
            <div
                ref={ref}
                className="flex items-center justify-center mermaid-diagram"
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
        </div>
    );
}

