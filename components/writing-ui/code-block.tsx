"use client";

import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { codeToHtml } from 'shiki';

interface CodeBlockProps {
    children: React.ReactNode;
    title?: string;
    language?: string;
    filename?: string;
    className?: string;
    showCopy?: boolean;
}

export function CodeBlock({
    children,
    title,
    language = 'plaintext',
    filename,
    className,
    showCopy = true
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // children을 문자열로 변환하는 함수
    const getCodeString = (children: React.ReactNode): string => {
        if (typeof children === 'string') {
            return children;
        }

        if (Array.isArray(children)) {
            return children.map(child => getCodeString(child)).join('');
        }

        if (React.isValidElement(children)) {
            const element = children as React.ReactElement<any>;
            return getCodeString(element.props.children);
        }

        return String(children);
    };

    const codeString = getCodeString(children);

    useEffect(() => {
        const highlightCode = async () => {
            try {
                setIsLoading(true);
                const html = await codeToHtml(codeString, {
                    lang: language,
                    themes: {
                        light: 'github-light',
                        dark: 'github-dark',
                    },
                    defaultColor: false,
                });
                setHighlightedCode(html);
            } catch (error) {
                console.error('Syntax highlighting error:', error);
                // 하이라이팅 실패 시 일반 코드로 표시
                setHighlightedCode(`<pre><code>${codeString}</code></pre>`);
            } finally {
                setIsLoading(false);
            }
        };

        highlightCode();
    }, [codeString, language]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={cn('rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 my-6 overflow-hidden', className)}>
            {(title || filename || language) && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                        {filename && (
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {filename}
                            </span>
                        )}
                        {language && language !== 'plaintext' && (
                            <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-mono">
                                {language}
                            </span>
                        )}
                        {title && !filename && (
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {title}
                            </span>
                        )}
                    </div>
                    {showCopy && (
                        <button
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Copy code"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            )}
                        </button>
                    )}
                </div>
            )}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="p-4">
                        <pre className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            <code>{codeString}</code>
                        </pre>
                    </div>
                ) : (
                    <div
                        className="shiki-wrapper [&_pre]:p-4 [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:overflow-x-auto [&_code]:text-sm [&_code]:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                )}
            </div>
        </div>
    );
}
