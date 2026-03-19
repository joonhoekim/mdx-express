import React from 'react'
import { cn } from '@/lib/utils'
import { MUGONG_CATEGORY_STYLES, MUGONG_DEFAULT_STYLE } from './constants'

interface MugongCardProps {
    name: string
    title: string
    category?: string
    power?: number
    difficulty?: number
    practical?: number
    popularity?: number
    quote?: string
    children?: React.ReactNode
    className?: string
}

function Stars({ count, max = 5 }: { count: number; max?: number }) {
    return (
        <span className="tracking-wider text-amber-500 dark:text-amber-400">
            {'★'.repeat(Math.min(count, max))}
            {'☆'.repeat(Math.max(max - count, 0))}
        </span>
    )
}

export function MugongCard({
    name,
    title,
    category,
    power,
    difficulty,
    practical,
    popularity,
    quote,
    children,
    className,
}: MugongCardProps) {
    const styles = category ? (MUGONG_CATEGORY_STYLES[category] || MUGONG_DEFAULT_STYLE) : MUGONG_DEFAULT_STYLE

    const stats = [
        { label: '내공', value: power },
        { label: '수련접근성', value: difficulty },
        { label: '실전력', value: practical },
        { label: '인지도', value: popularity },
    ].filter(s => s.value !== undefined)

    return (
        <div
            className={cn(
                'rounded-xl border-2 p-5 my-6 transition-all hover:shadow-lg',
                styles.border,
                styles.bg,
                className
            )}
        >
            {category && (
                <span className={cn(
                    'inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3',
                    styles.badge
                )}>
                    {category}
                </span>
            )}

            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 !mt-0 !mb-0.5">
                {title}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 !mt-0 mb-4 font-mono">
                {name}
            </p>

            {stats.length > 0 && (
                <div className="space-y-1.5 mb-4">
                    {stats.map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-3 text-sm">
                            <span className="w-20 text-gray-600 dark:text-gray-400 shrink-0">{label}</span>
                            <Stars count={value!} />
                        </div>
                    ))}
                </div>
            )}

            {quote && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p className="text-sm italic text-gray-600 dark:text-gray-400 leading-relaxed !my-0">
                        &ldquo;{quote}&rdquo;
                    </p>
                </div>
            )}

            {children && (
                <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {children}
                </div>
            )}
        </div>
    )
}
