"use client";

import React, { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// children을 문자열로 변환하는 순수 함수 (컴포넌트 외부 — 매 렌더마다 재생성 방지)
function getCodeString(children: React.ReactNode): string {
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
}

import { LANGUAGE_ALIASES, LANGUAGE_BADGE_COLORS } from './constants';

function resolveLanguage(lang: string): string {
    return LANGUAGE_ALIASES[lang.toLowerCase()] || lang;
}

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
    const codeString = getCodeString(children);
    const effectiveLanguage = resolveLanguage(language);

    const highlightedHtml = useMemo(() => {
        try {
            if (hljs.getLanguage(effectiveLanguage)) {
                return hljs.highlight(codeString, { language: effectiveLanguage }).value;
            }
        } catch (error) {
            console.warn(`Highlight.js error for language "${effectiveLanguage}":`, error);
        }
        return null;
    }, [codeString, effectiveLanguage]);

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
        <div className={cn('w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 my-6 overflow-hidden', className)}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                    {filename && (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {filename}
                        </span>
                    )}
                    {language !== 'plaintext' && (
                        <span className={cn(
                            "text-xs px-2 py-1 rounded font-mono",
                            LANGUAGE_BADGE_COLORS[language.toLowerCase()] || "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        )}>
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
            <div className="overflow-x-auto bg-[#0d1117]">
                <pre className="p-4 m-0 !bg-transparent">
                    {highlightedHtml ? (
                        <code
                            className={`hljs language-${effectiveLanguage} text-sm leading-relaxed !bg-transparent !p-0`}
                            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                        />
                    ) : (
                        <code
                            className="text-sm leading-relaxed !bg-transparent !p-0"
                            style={{ color: '#e6edf3' }}
                        >{codeString}</code>
                    )}
                </pre>
            </div>
        </div>
    );
}
