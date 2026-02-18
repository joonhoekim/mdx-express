"use client";

import React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
    defaultValue?: string
    className?: string
    children: React.ReactNode
}

interface TabsListProps {
    className?: string
    children: React.ReactNode
}

interface TabsTriggerProps {
    value: string
    className?: string
    children: React.ReactNode
}

interface TabsContentProps {
    value: string
    className?: string
    children: React.ReactNode
}

const TabsContext = React.createContext<{
    activeTab: string
    setActiveTab: (value: string) => void
}>({
    activeTab: '',
    setActiveTab: () => { }
})

export function Tabs({ defaultValue, className, children }: TabsProps) {
    const [activeTab, setActiveTab] = React.useState(() => {
        if (defaultValue) return defaultValue;
        // children에서 첫 TabsTrigger의 value 추출
        const tabsList = React.Children.toArray(children)
            .find(child => React.isValidElement(child) && child.type === TabsList);
        if (tabsList && React.isValidElement(tabsList)) {
            const firstTrigger = React.Children.toArray((tabsList as React.ReactElement<TabsListProps>).props.children)
                .find(child => React.isValidElement(child) && child.type === TabsTrigger);
            if (firstTrigger && React.isValidElement(firstTrigger)) {
                return (firstTrigger as React.ReactElement<TabsTriggerProps>).props.value;
            }
        }
        return '';
    })

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn('my-6', className)}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

export function TabsList({ className, children }: TabsListProps) {
    return (
        <div className={cn(
            'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400',
            className
        )}>
            {children}
        </div>
    )
}

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
    const { activeTab, setActiveTab } = React.useContext(TabsContext)

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300',
                activeTab === value
                    ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-950 dark:text-gray-50'
                    : 'hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100',
                className
            )}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, className, children }: TabsContentProps) {
    const { activeTab } = React.useContext(TabsContext)

    if (activeTab !== value) return null

    return (
        <div className={cn(
            'mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300',
            className
        )}>
            {children}
        </div>
    )
} 