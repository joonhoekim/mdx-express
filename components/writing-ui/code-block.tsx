"use client";

import React from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
    children: React.ReactNode
    title?: string
    language?: string
    filename?: string
    className?: string
    showCopy?: boolean
}

export function CodeBlock({
    children,
    title,
    language,
    filename,
    className,
    showCopy = true
}: CodeBlockProps) {
    const [copied, setCopied] = React.useState(false)

    const copyToClipboard = async () => {
        const textContent = React.Children.toArray(children)
            .map(child => typeof child === 'string' ? child : '')
            .join('')

        try {
            await navigator.clipboard.writeText(textContent)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <div className={cn('rounded-lg border bg-gray-950 my-4', className)}>
            {(title || filename || language) && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        {filename && (
                            <span className="text-sm font-medium text-gray-300">
                                {filename}
                            </span>
                        )}
                        {language && (
                            <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400">
                                {language}
                            </span>
                        )}
                        {title && !filename && (
                            <span className="text-sm font-medium text-gray-300">
                                {title}
                            </span>
                        )}
                    </div>
                    {showCopy && (
                        <button
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-gray-800 rounded transition-colors"
                            title="Copy code"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-400" />
                            ) : (
                                <Copy className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    )}
                </div>
            )}
            <div className="p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300 leading-relaxed">
                    <code>{children}</code>
                </pre>
            </div>
        </div>
    )
} 