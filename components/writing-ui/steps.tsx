import React from 'react'
import { cn } from '@/lib/utils'

interface StepsProps {
    children: React.ReactNode
    className?: string
}

interface StepProps {
    title: string
    children: React.ReactNode
    className?: string
}

export function Steps({ children, className }: StepsProps) {
    return (
        <div className={cn('my-6', className)}>
            <div className="relative">
                {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child) && child.type === Step) {
                        return React.cloneElement(child as React.ReactElement<StepWithNumberProps>, {
                            stepNumber: index + 1,
                            isLast: index === React.Children.count(children) - 1
                        })
                    }
                    return child
                })}
            </div>
        </div>
    )
}

interface StepWithNumberProps extends StepProps {
    stepNumber?: number
    isLast?: boolean
}

export function Step({ title, children, className, stepNumber, isLast }: StepWithNumberProps) {
    return (
        <div className={cn('relative flex gap-4 pb-8', isLast && 'pb-0', className)}>
            <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                    {stepNumber}
                </div>
                {!isLast && (
                    <div className="mt-2 h-full w-px bg-gray-200 dark:bg-gray-700" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {title}
                </h3>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-6 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {children}
                </div>
            </div>
        </div>
    )
} 