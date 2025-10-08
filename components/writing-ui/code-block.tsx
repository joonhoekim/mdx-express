"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

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
    const codeRef = useRef<HTMLElement>(null);

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

    // 언어 매핑 (지원하지 않는 언어를 비슷한 언어로 매핑)
    const getLanguageAlias = (lang: string): string => {
        const aliases: Record<string, string> = {
            'mdx': 'markdown',
            'md': 'markdown',
            'vue': 'html',
            'svelte': 'html',
        };
        return aliases[lang.toLowerCase()] || lang;
    };

    const effectiveLanguage = getLanguageAlias(language);

    useEffect(() => {
        if (codeRef.current) {
            // 기존 하이라이팅 클래스 제거
            codeRef.current.removeAttribute('data-highlighted');

            // 하이라이팅 적용
            try {
                // 언어가 지원되는지 확인
                const languageSubset = hljs.getLanguage(effectiveLanguage);

                if (languageSubset) {
                    hljs.highlightElement(codeRef.current);
                } else {
                    // 지원하지 않는 언어면 plaintext로 하이라이팅
                    codeRef.current.className = `language-plaintext text-sm leading-relaxed !bg-transparent`;
                    hljs.highlightElement(codeRef.current);
                }
            } catch (error) {
                console.warn(`Highlight.js error for language "${effectiveLanguage}":`, error);
                // 에러 발생 시 plaintext로 fallback
                if (codeRef.current) {
                    codeRef.current.className = `language-plaintext text-sm leading-relaxed !bg-transparent`;
                }
            }
        }
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
            <div className="overflow-x-auto bg-[#0d1117]">
                <pre className="p-4 m-0 !bg-transparent"><code
                    ref={codeRef}
                    className={`language-${effectiveLanguage} text-sm leading-relaxed !bg-transparent text-slate-200`}
                    style={{ color: '#e6edf3' }}
                >{codeString}</code></pre>
            </div>
        </div>
    );
}
