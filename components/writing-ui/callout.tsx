import React from 'react'
import { TriangleAlert, Info, CircleCheckBig, CircleX, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CALLOUT_STYLES } from './constants'

interface CalloutProps {
    type?: 'info' | 'warning' | 'error' | 'success' | 'note'
    title?: string
    children: React.ReactNode
    className?: string
}

const iconMap = {
    info: Info,
    warning: TriangleAlert,
    error: CircleX,
    success: CircleCheckBig,
    note: Lightbulb
}

export function Callout({ type = 'info', title, children, className }: CalloutProps) {
    const Icon = iconMap[type]
    const styles = CALLOUT_STYLES[type]

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