"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePanZoom } from '@/hooks/use-pan-zoom';
import mermaid from 'mermaid';

// 모듈 레벨 초기화 (1회만 실행)
let mermaidInitialized = false;
function ensureMermaidInit() {
    if (mermaidInitialized) return;
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
        },
        themeVariables: {
            fontSize: '14px',
        },
    });
    mermaidInitialized = true;
}

interface MermaidProps {
    children: string;
    className?: string;
    title?: string;
}

export function Mermaid({ children, className, title }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const {
        containerRef,
        scale,
        translateX,
        translateY,
        isZoomed,
        isGesturing,
        zoomIn,
        zoomOut,
        resetZoom,
        handlers,
    } = usePanZoom();

    useEffect(() => {
        const renderDiagram = async () => {
            if (!ref.current) return;

            try {
                ensureMermaidInit();

                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, children.trim());
                setSvgContent(svg);
                setError(null);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
        };

        renderDiagram();
    }, [children]);

    // SVG 콘텐츠 변경 시 줌 리셋
    useEffect(() => {
        resetZoom();
    }, [svgContent, resetZoom]);

    // -- Fullscreen --
    const toggleFullscreen = useCallback(() => {
        if (!wrapperRef.current) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            wrapperRef.current.requestFullscreen();
        }
    }, []);

    // 브라우저 fullscreenchange 이벤트로 상태 동기화
    useEffect(() => {
        const handleChange = () => {
            const active = document.fullscreenElement === wrapperRef.current;
            setIsFullscreen(active);
            if (!active) resetZoom();
        };

        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, [resetZoom]);

    // 키보드 줌 + 전체화면 지원
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            zoomIn();
        } else if (e.key === '-') {
            e.preventDefault();
            zoomOut();
        } else if (e.key === '0') {
            e.preventDefault();
            resetZoom();
        } else if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            toggleFullscreen();
        }
    };

    if (error) {
        return (
            <div className={cn('rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 my-4', className)}>
                {title && (
                    <div className="font-medium text-red-900 dark:text-red-200 mb-2">
                        {title}
                    </div>
                )}
                <div className="text-sm text-red-800 dark:text-red-300">
                    Mermaid 렌더링 오류: {error}
                </div>
                <pre className="mt-2 text-xs text-red-700 dark:text-red-400 overflow-x-auto">
                    {children}
                </pre>
            </div>
        );
    }

    const scalePercent = Math.round(scale * 100);

    return (
        <div
            ref={wrapperRef}
            className={cn(
                'group relative w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 my-6',
                isFullscreen && 'flex flex-col rounded-none border-none m-0 p-8',
                className,
            )}
        >
            {title && (
                <div className="font-medium text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                    {title}
                </div>
            )}
            <div
                ref={(el) => {
                    // 두 ref 동시 할당
                    (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
                    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                }}
                className={cn(
                    'overflow-hidden mermaid-diagram',
                    isFullscreen && 'flex-1',
                )}
                data-zoomed={isZoomed || undefined}
                data-panning={isGesturing && isZoomed || undefined}
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                <div
                    {...handlers}
                    style={{
                        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        transition: isGesturing ? 'none' : 'transform 0.2s ease-out',
                        touchAction: isZoomed ? 'none' : 'pan-x pan-y',
                        height: isFullscreen ? '100%' : undefined,
                    }}
                    dangerouslySetInnerHTML={{
                        __html: svgContent.replace(
                            '<svg',
                            `<svg style="width: 100%; height: ${isFullscreen ? '100%' : 'auto'}; min-width: 100%;"`
                        )
                    }}
                />
            </div>

            {/* 줌 컨트롤 — 호버 시 표시, 전체화면에서는 항상 표시 */}
            <div
                className={cn(
                    'absolute top-2 right-2 flex items-center gap-0.5 rounded-lg',
                    'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm',
                    'border border-slate-200 dark:border-slate-700',
                    'shadow-sm',
                    'transition-opacity duration-200 opacity-100',
                )}
                role="toolbar"
                aria-label="Diagram zoom controls"
            >
                <button
                    onClick={zoomOut}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-l-lg transition-colors"
                    aria-label="Zoom out"
                    title="Zoom out (-)"
                >
                    <ZoomOut className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </button>
                <span
                    className="px-2 text-xs font-mono text-slate-600 dark:text-slate-400 select-none min-w-[3.5rem] text-center"
                    aria-live="polite"
                >
                    {scalePercent}%
                </span>
                <button
                    onClick={zoomIn}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Zoom in"
                    title="Zoom in (+)"
                >
                    <ZoomIn className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </button>
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
                <button
                    onClick={resetZoom}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Reset zoom"
                    title="Reset zoom (0)"
                >
                    <RotateCcw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </button>
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
                <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-r-lg transition-colors"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
                >
                    {isFullscreen
                        ? <Minimize2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        : <Maximize2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    }
                </button>
            </div>
        </div>
    );
}
