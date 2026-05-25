import type { ChartConfig } from '@/components/ui/chart'
import {
    CHART_SERIES_COLORS,
    CHART_PALETTE_ORDER,
    type SeriesColor,
} from './constants'

export interface SeriesDef {
    key: string
    label?: string
    color?: SeriesColor
}

export interface PieDatum {
    name: string
    value: number
    color?: SeriesColor
}

/** color가 없으면 등장 순서대로 팔레트에서 자동 배정. 항상 hex 문자열을 반환. */
export function resolveColor(color: SeriesColor | undefined, index: number): string {
    const key = color ?? CHART_PALETTE_ORDER[index % CHART_PALETTE_ORDER.length]
    return CHART_SERIES_COLORS[key]
}

/** Bar/Line에서 shadcn ChartContainer에 넘길 ChartConfig를 만든다.
 *  각 시리즈 key에 대해 --color-<key> CSS 변수가 자동 주입된다. */
export function buildSeriesConfig(series: SeriesDef[]): ChartConfig {
    const config: ChartConfig = {}
    series.forEach((s, i) => {
        config[s.key] = {
            label: s.label ?? s.key,
            color: resolveColor(s.color, i),
        }
    })
    return config
}
