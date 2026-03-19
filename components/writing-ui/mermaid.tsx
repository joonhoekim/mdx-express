"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { cn } from '@/lib/utils';
import { usePanZoom } from '@/hooks/use-pan-zoom';
import { ensureMermaidInit, preprocessMermaidContent } from './mermaid-theme';
import { MermaidControls } from './mermaid-controls';

interface MermaidProps { children: string; className?: string; title?: string }

export function Mermaid({ children, className, title }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDark, setIsDark] = useState(false);

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

    // 다크모드 감지 및 변경 감시
    useEffect(() => {
        const root = document.documentElement;
        setIsDark(root.classList.contains('dark'));

        const observer = new MutationObserver(() => {
            setIsDark(root.classList.contains('dark'));
        });
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const renderDiagram = async () => {
            if (!ref.current) return;

            try {
                ensureMermaidInit(isDark);

                const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
                const processed = preprocessMermaidContent(children.trim());
                const { svg } = await mermaid.render(id, processed);
                setSvgContent(svg);
                setError(null);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
        };

        renderDiagram();
    }, [children, isDark]);

    // SVG 콘텐츠 변경 시 줌 리셋
    useEffect(() => {
        resetZoom();
    }, [svgContent, resetZoom]);

    // -- Fullscreen (CSS 기반) --
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => {
            if (prev) resetZoom();
            return !prev;
        });
    }, [resetZoom]);

    // ESC 키로 풀스크린 해제
    useEffect(() => {
        if (!isFullscreen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setIsFullscreen(false);
                resetZoom();
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isFullscreen, resetZoom]);

    // 풀스크린 시 body 스크롤 잠금
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isFullscreen]);

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

    return (
        <div
            ref={wrapperRef}
            className={cn(
                'group relative w-full rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80 p-6 my-6 shadow-sm dark:shadow-slate-950/30',
                isFullscreen && 'fixed inset-0 z-50 flex flex-col rounded-none border-none m-0 p-8 bg-white dark:bg-slate-900',
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
                    (ref as React.RefObject<HTMLDivElement | null>).current = el;
                    (containerRef as React.RefObject<HTMLDivElement | null>).current = el;
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
            <MermaidControls
                scale={scale}
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                resetZoom={resetZoom}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
            />
        </div>
    );
}
