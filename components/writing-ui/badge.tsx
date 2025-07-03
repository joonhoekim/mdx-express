import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
    className?: string
}

const badgeVariants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700'
}

const badgeSizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
}

export function Badge({
    variant = 'default',
    size = 'sm',
    children,
    className
}: BadgeProps) {
    return (
        <span className={cn(
            'inline-flex items-center rounded-full font-medium transition-colors',
            badgeVariants[variant],
            badgeSizes[size],
            className
        )}>
            {children}
        </span>
    )
} 