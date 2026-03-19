"use client";

import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MermaidControlsProps {
    scale: number;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    className?: string;
}

export function MermaidControls({
    scale,
    zoomIn,
    zoomOut,
    resetZoom,
    isFullscreen,
    toggleFullscreen,
    className,
}: MermaidControlsProps) {
    const scalePercent = Math.round(scale * 100);

    return (
        <div
            className={cn(
                'absolute top-2 right-2 flex items-center gap-0.5 rounded-lg',
                'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm',
                'border border-slate-200 dark:border-slate-700',
                'shadow-sm',
                'transition-opacity duration-200 opacity-100',
                className,
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
    );
}
