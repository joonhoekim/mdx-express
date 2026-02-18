"use client";

import React from 'react'
import { cn } from '@/lib/utils'

type ConnectionItem = { mathLabel: string; codeLabel: string }

interface MathCodeBridgeProps {
    title?: string
    /** @deprecated Use children code blocks instead */
    math?: string | string[]
    /** @deprecated Use children code blocks instead */
    code?: string | string[]
    language?: string
    connections?: ConnectionItem[] | string
    className?: string
    children?: React.ReactNode
}

function parseConnections(connections: ConnectionItem[] | string): ConnectionItem[] {
    if (Array.isArray(connections)) return connections
    if (!connections) return []
    return connections.split('|').map(pair => {
        const [mathLabel, codeLabel] = pair.split('::').map(s => s.trim())
        return { mathLabel: mathLabel ?? '', codeLabel: codeLabel ?? '' }
    }).filter(c => c.mathLabel && c.codeLabel)
}

function getTextContent(node: React.ReactNode): string {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(getTextContent).join('')
    if (React.isValidElement(node)) {
        return getTextContent((node.props as any).children)
    }
    return String(node ?? '')
}

function extractFromChildren(children: React.ReactNode): {
    mathText: string
    codeText: string
    codeLang: string
} {
    const mathParts: string[] = []
    const codeParts: string[] = []
    let codeLang = 'typescript'

    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return
        const props = child.props as any
        const language = props?.language
        if (!language) return

        const content = getTextContent(props.children).replace(/\n$/, '')

        if (language === 'math') {
            mathParts.push(content)
        } else {
            codeLang = language === 'ts' ? 'typescript' : language
            codeParts.push(content)
        }
    })

    return {
        mathText: mathParts.join('\n'),
        codeText: codeParts.join('\n'),
        codeLang,
    }
}

export function MathCodeBridge({
    title,
    math,
    code,
    language = 'typescript',
    connections,
    className,
    children,
}: MathCodeBridgeProps) {
    let mathText: string
    let codeText: string
    let effectiveLang = language

    if (children) {
        const extracted = extractFromChildren(children)
        mathText = extracted.mathText
        codeText = extracted.codeText
        effectiveLang = extracted.codeLang
    } else {
        mathText = Array.isArray(math) ? math.join('\n') : (math ?? '')
        codeText = Array.isArray(code) ? code.join('\n') : (code ?? '')
    }

    const parsedConnections = connections ? parseConnections(connections) : []

    return (
        <div className={cn(
            'not-prose my-6 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm',
            className
        )}>
            {title && (
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {title}
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Math Panel */}
                <div className="border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
                    <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            Math
                        </span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900/50 overflow-x-auto">
                        <pre className="m-0 p-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap bg-transparent border-none">{mathText}</pre>
                    </div>
                </div>

                {/* Code Panel */}
                <div>
                    <div className="px-3 py-1.5 bg-green-50 dark:bg-green-950/30 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                            Code{effectiveLang !== 'typescript' ? ` (${effectiveLang})` : ''}
                        </span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900/50 overflow-x-auto">
                        <pre className="m-0 p-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap bg-transparent border-none">{codeText}</pre>
                    </div>
                </div>
            </div>

            {/* Connections Table */}
            {parsedConnections.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="px-4 py-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Connections
                        </span>
                    </div>
                    <div className="px-4 pb-3">
                        <div className="space-y-1.5">
                            {parsedConnections.map((conn, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        {conn.mathLabel}
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500">
                                        =
                                    </span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        {conn.codeLabel}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
