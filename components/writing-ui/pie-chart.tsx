"use client"

import {
    Cell,
    Legend,
    Pie,
    PieChart as RechartsPieChart,
} from 'recharts'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { resolveColor, type PieDatum } from './chart-utils'

interface PieChartProps {
    data: PieDatum[]
    height?: number
    className?: string
}

export function PieChart({ data, height = 320, className }: PieChartProps) {
    const showLegend = data.length > 1

    return (
        <div className={cn('my-6 w-full', className)} style={{ height }}>
            <ChartContainer config={{}} className="!aspect-auto h-full w-full">
                <RechartsPieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius="80%"
                    >
                        {data.map((d, i) => (
                            <Cell key={i} fill={resolveColor(d.color, i)} />
                        ))}
                    </Pie>
                    {showLegend && <Legend />}
                </RechartsPieChart>
            </ChartContainer>
        </div>
    )
}
