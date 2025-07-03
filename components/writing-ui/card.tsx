import React from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardProps {
    title?: string
    description?: string
    href?: string
    icon?: React.ReactNode
    children?: React.ReactNode
    className?: string
}

export function Card({ title, description, href, icon, children, className }: CardProps) {
    const CardContent = (
        <div className={cn(
            'group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900',
            href && 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600',
            className
        )}>
            <div className="flex items-start gap-4">
                {icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        {icon}
                    </div>
                )}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        {title && (
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {title}
                            </h3>
                        )}
                        {href && (
                            <ExternalLink className="h-4 w-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                    </div>
                    {description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                    {children && (
                        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    if (href) {
        return (
            <a href={href} className="block my-4" target="_blank" rel="noopener noreferrer">
                {CardContent}
            </a>
        )
    }

    return <div className="my-4">{CardContent}</div>
} 