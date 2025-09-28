import React from 'react'
import { BookOpen, ExternalLink, FileText, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReferenceProps {
    title: string
    description?: string
    href?: string
    type?: 'article' | 'documentation' | 'tutorial' | 'reference' | 'link'
    author?: string
    date?: string
    className?: string
}

interface ReferenceListProps {
    children: React.ReactNode
    title?: string
    className?: string
}

const referenceIcons = {
    article: FileText,
    documentation: BookOpen,
    tutorial: BookOpen,
    reference: BookOpen,
    link: Link2
}

const referenceColors = {
    article: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
    documentation: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30',
    tutorial: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30',
    reference: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30',
    link: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/30'
}

export function Reference({
    title,
    description,
    href,
    type = 'link',
    author,
    date,
    className
}: ReferenceProps) {
    const Icon = referenceIcons[type] || Link2
    const colorClasses = referenceColors[type] || referenceColors.link

    const content = (
        <div className={cn(
            'group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900',
            href && 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600',
            className
        )}>
            <div className="flex items-start gap-3">
                <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md',
                    colorClasses
                )}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {title}
                        </h4>
                        {href && (
                            <ExternalLink className="h-3 w-3 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
                        )}
                    </div>
                    {description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {description}
                        </p>
                    )}
                    {(author || date) && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {author && <span>{author}</span>}
                            {author && date && <span>•</span>}
                            {date && <span>{date}</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                {content}
            </a>
        )
    }

    return content
}

export function ReferenceList({ children, title = '참고자료', className }: ReferenceListProps) {
    return (
        <div className={cn('my-6', className)}>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
            </h3>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    )
} 