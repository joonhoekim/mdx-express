import React from 'react'
import { Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlockquoteProps {
    children: React.ReactNode
    author?: string
    cite?: string
    className?: string
}

export function Blockquote({ children, author, cite, className }: BlockquoteProps) {
    return (
        <blockquote className={cn(
            'my-6 border-l-4 border-gray-300 bg-gray-50 pl-6 pr-4 py-4 italic dark:border-gray-600 dark:bg-gray-800/50',
            className
        )}>
            <div className="flex items-start gap-3">
                <Quote className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {children}
                    </div>
                    {(author || cite) && (
                        <footer className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            {author && <span>— {author}</span>}
                            {cite && (
                                <cite className={cn('ml-1', author && 'ml-2')}>
                                    {cite}
                                </cite>
                            )}
                        </footer>
                    )}
                </div>
            </div>
        </blockquote>
    )
} 