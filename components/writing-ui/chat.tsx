import React from 'react'
import { cn } from '@/lib/utils'
import {
    CHAT_SPEAKER_COLORS,
    CHAT_PALETTE_ORDER,
    CHAT_FALLBACK_COLOR,
} from './constants'

export type SpeakerColor = keyof typeof CHAT_SPEAKER_COLORS

export interface Speaker {
    name: string
    side?: 'left' | 'right'
    color?: SpeakerColor
}

interface ChatProps {
    variant?: 'bubble' | 'transcript'
    speakers: Record<string, Speaker>
    children: React.ReactNode
    className?: string
}

interface MessageProps {
    from: string
    children: React.ReactNode
    className?: string
}

interface ResolvedSpeaker {
    name: string
    side: 'left' | 'right'
    styles: typeof CHAT_FALLBACK_COLOR
}

const warnedSpeakerIds = new Set<string>()
function warnUnknownSpeaker(id: string) {
    if (process.env.NODE_ENV === 'production') return
    if (warnedSpeakerIds.has(id)) return
    warnedSpeakerIds.add(id)
    console.warn(`[Chat] 알 수 없는 화자 id: "${id}"`)
}

function resolveSpeakers(speakers: Record<string, Speaker>): Record<string, ResolvedSpeaker> {
    const ids = Object.keys(speakers)
    const resolved: Record<string, ResolvedSpeaker> = {}

    ids.forEach((id, index) => {
        const speaker = speakers[id]
        const side: 'left' | 'right' =
            speaker.side ?? (ids.length === 2 && index === 0 ? 'right' : 'left')
        const colorKey = speaker.color ?? CHAT_PALETTE_ORDER[index % CHAT_PALETTE_ORDER.length]
        resolved[id] = {
            name: speaker.name,
            side,
            styles: CHAT_SPEAKER_COLORS[colorKey],
        }
    })

    return resolved
}

function fallbackSpeaker(id: string): ResolvedSpeaker {
    warnUnknownSpeaker(id)
    return {
        name: id || '알 수 없음',
        side: 'left',
        styles: CHAT_FALLBACK_COLOR,
    }
}

function isMessage(child: React.ReactNode): child is React.ReactElement<MessageProps> {
    return React.isValidElement(child) && child.type === Message
}

function ChatBubble({
    children,
    resolved,
    className,
}: {
    children: React.ReactNode
    resolved: Record<string, ResolvedSpeaker>
    className?: string
}) {
    const items = React.Children.toArray(children)
    let prevFrom: string | null = null
    let prevSide: 'left' | 'right' | null = null

    return (
        <div
            className={cn(
                'my-6 mx-auto max-w-[1200px] rounded-lg border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/40 p-4',
                className,
            )}
        >
            {items.map((child, i) => {
                if (!isMessage(child)) {
                    prevFrom = null
                    prevSide = null
                    return <React.Fragment key={i}>{child}</React.Fragment>
                }
                const { from, children: content } = child.props
                const speaker = resolved[from] ?? fallbackSpeaker(from)
                const isContinuation = prevFrom === from
                const isRight = speaker.side === 'right'
                const needsSplitter = prevSide === 'right' && !isRight
                prevFrom = from
                prevSide = speaker.side

                return (
                    <React.Fragment key={i}>
                        {needsSplitter && (
                            <hr className="my-3 border-t border-gray-200 dark:border-gray-700" />
                        )}
                        <div
                            className={cn(
                                'flex flex-col',
                                isRight ? 'items-end' : 'items-start',
                                isContinuation ? 'mt-1' : (needsSplitter ? 'mt-3' : 'mt-4 first:mt-0'),
                            )}
                        >
                            {!isContinuation && (
                                <span className={cn('text-xs font-medium mb-1 px-1', speaker.styles.name)}>
                                    {speaker.name}
                                </span>
                            )}
                            <div
                                className={cn(
                                    'text-sm leading-6 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
                                    isRight
                                        ? cn(
                                            'max-w-[80%] rounded-2xl border px-4 py-2.5',
                                            speaker.styles.bubble,
                                            isContinuation && 'rounded-tr-md',
                                        )
                                        : 'w-full px-1',
                                )}
                            >
                                {content}
                            </div>
                        </div>
                    </React.Fragment>
                )
            })}
        </div>
    )
}

function ChatTranscript({
    children,
    resolved,
    className,
}: {
    children: React.ReactNode
    resolved: Record<string, ResolvedSpeaker>
    className?: string
}) {
    const items = React.Children.toArray(children)
    let prevFrom: string | null = null

    return (
        <div className={cn('my-6 mx-auto max-w-[1200px] space-y-4', className)}>
            {items.map((child, i) => {
                if (!isMessage(child)) {
                    prevFrom = null
                    return <React.Fragment key={i}>{child}</React.Fragment>
                }
                const { from, children: content } = child.props
                const speaker = resolved[from] ?? fallbackSpeaker(from)
                const isContinuation = prevFrom === from
                prevFrom = from

                return (
                    <div key={i} className={cn(isContinuation && '-mt-2')}>
                        {!isContinuation && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn('text-sm', speaker.styles.marker)} aria-hidden>●</span>
                                <span className={cn('font-semibold text-base', speaker.styles.name)}>
                                    {speaker.name}
                                </span>
                            </div>
                        )}
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 pl-5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            {content}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export function Chat({
    variant = 'bubble',
    speakers,
    children,
    className,
}: ChatProps) {
    const resolved = resolveSpeakers(speakers)

    if (variant === 'transcript') {
        return <ChatTranscript resolved={resolved} className={className}>{children}</ChatTranscript>
    }
    return <ChatBubble resolved={resolved} className={className}>{children}</ChatBubble>
}

/** Chat 자식 마커 컴포넌트. 실제 렌더는 Chat이 props를 읽어 처리한다.
 *  Chat 밖에서 사용되면 children을 그대로 패스스루. */
export function Message({ children }: MessageProps) {
    return <>{children}</>
}
