import React from 'react'
import { AlertTriangle, Info, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalloutProps {
    type?: 'info' | 'warning' | 'error' | 'success' | 'note'
    title?: string
    children: React.ReactNode
    className?: string
}

const calloutStyles = {
    info: {
        container: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100'
    },
    warning: {
        container: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-100',
        icon: 'text-yellow-600 dark:text-yellow-400',
        title: 'text-yellow-900 dark:text-yellow-100'
    },
    error: {
        container: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-100'
    },
    success: {
        container: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/30 dark:text-green-100',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-100'
    },
    note: {
        container: 'border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100',
        icon: 'text-gray-600 dark:text-gray-400',
        title: 'text-gray-900 dark:text-gray-100'
    }
}

const iconMap = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle,
    note: Lightbulb
}

export function Callout({ type = 'info', title, children, className }: CalloutProps) {
    const Icon = iconMap[type]
    const styles = calloutStyles[type]

    return (
        <div
            className={cn(
                'rounded-lg border p-4 my-4',
                styles.container,
                className
            )}
        >
            <div className="flex items-start gap-3">
                <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', styles.icon)} />
                <div className="flex-1">
                    {title && (
                        <h5 className={cn('font-semibold mb-2', styles.title)}>
                            {title}
                        </h5>
                    )}
                    <div className="text-sm leading-6 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
} 