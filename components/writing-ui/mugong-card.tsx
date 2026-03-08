import React from 'react'
import { cn } from '@/lib/utils'

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

const categoryStyles: Record<string, { badge: string; border: string; bg: string }> = {
    '백엔드': {
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        bg: 'bg-green-50/50 dark:bg-green-950/20',
    },
    '프론트엔드': {
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    },
    'SSR/풀스택': {
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        bg: 'bg-purple-50/50 dark:bg-purple-950/20',
    },
    '모바일': {
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        bg: 'bg-orange-50/50 dark:bg-orange-950/20',
    },
    'DB': {
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    },
    'DevOps': {
        badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
        border: 'border-teal-200 dark:border-teal-800',
        bg: 'bg-teal-50/50 dark:bg-teal-950/20',
    },
    'AI': {
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        bg: 'bg-rose-50/50 dark:bg-rose-950/20',
    },
}

const defaultStyle = {
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    bg: 'bg-gray-50/50 dark:bg-gray-950/20',
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
    const styles = category ? (categoryStyles[category] || defaultStyle) : defaultStyle

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
