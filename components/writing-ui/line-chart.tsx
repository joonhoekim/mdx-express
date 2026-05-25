"use client"

import {
    CartesianGrid,
    Line,
    LineChart as RechartsLineChart,
    XAxis,
    YAxis,
} from 'recharts'
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { buildSeriesConfig, type SeriesDef } from './chart-utils'

interface LineChartProps {
    data: Array<Record<string, string | number>>
    series: SeriesDef[]
    xKey?: string
    xLabel?: string
    yLabel?: string
    height?: number
    className?: string
}

export function LineChart({
    data,
    series,
    xKey = 'name',
    xLabel,
    yLabel,
    height = 320,
    className,
}: LineChartProps) {
    const config = buildSeriesConfig(series)
    const showLegend = series.length > 1

    return (
        <div className={cn('my-6 w-full', className)} style={{ height }}>
            <ChartContainer config={config} className="!aspect-auto h-full w-full">
                <RechartsLineChart
                    data={data}
                    margin={{ left: yLabel ? 12 : 0, bottom: xLabel ? 16 : 0, right: 8, top: 8 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey={xKey}
                        tickLine={false}
                        axisLine={false}
                        label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -8, fill: 'currentColor', fontSize: 12 } : undefined}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: 'currentColor', fontSize: 12, style: { textAnchor: 'middle' } } : undefined}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {showLegend && <ChartLegend content={<ChartLegendContent />} />}
                    {series.map((s) => (
                        <Line
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            stroke={`var(--color-${s.key})`}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </RechartsLineChart>
            </ChartContainer>
        </div>
    )
}
