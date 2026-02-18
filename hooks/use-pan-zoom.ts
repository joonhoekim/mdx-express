"use client";

import { useState, useRef, useCallback, useEffect, type PointerEvent } from 'react';

interface UsePanZoomOptions {
    minScale?: number;
    maxScale?: number;
    zoomFactor?: number;
}

interface UsePanZoomReturn {
    containerRef: React.RefObject<HTMLDivElement | null>;
    scale: number;
    translateX: number;
    translateY: number;
    isZoomed: boolean;
    isGesturing: boolean;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    handlers: {
        onPointerDown: (e: PointerEvent) => void;
        onPointerMove: (e: PointerEvent) => void;
        onPointerUp: (e: PointerEvent) => void;
        onPointerCancel: (e: PointerEvent) => void;
        onPointerLeave: (e: PointerEvent) => void;
    };
}

/**
 * 마우스 휠 줌, 드래그 팬, 핀치 줌을 처리하는 커스텀 hook.
 * CSS transform 기반으로 GPU 가속을 활용.
 */
export function usePanZoom(options: UsePanZoomOptions = {}): UsePanZoomReturn {
    const {
        minScale = 1,
        maxScale = 4,
        zoomFactor = 0.15,
    } = options;

    const containerRef = useRef<HTMLDivElement | null>(null);

    const [scale, setScale] = useState(1);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [isGesturing, setIsGesturing] = useState(false);

    // 리렌더 없이 제스처 상태 추적
    const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
    const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
    const pinchStartDist = useRef<number | null>(null);
    const pinchStartScale = useRef<number>(1);

    // -- 경계 제한 (콘텐츠가 50% 이상 보이도록) --
    const clampTranslate = useCallback((tx: number, ty: number, s: number): [number, number] => {
        if (s <= 1) return [0, 0];

        const container = containerRef.current;
        if (!container) return [tx, ty];

        const w = container.clientWidth;
        const h = container.clientHeight;

        // scale 적용 시 콘텐츠 크기
        const contentW = w * s;
        const contentH = h * s;

        // 콘텐츠가 컨테이너의 50% 이상 보이도록 제한
        const minTx = -(contentW - w * 0.5);
        const maxTx = w * 0.5;
        const minTy = -(contentH - h * 0.5);
        const maxTy = h * 0.5;

        return [
            Math.min(maxTx, Math.max(minTx, tx)),
            Math.min(maxTy, Math.max(minTy, ty)),
        ];
    }, []);

    // -- 특정 포인트를 중심으로 줌 적용 --
    const applyZoom = useCallback((newScale: number, centerX: number, centerY: number) => {
        const clamped = Math.min(maxScale, Math.max(minScale, newScale));

        setScale(prev => {
            setTranslateX(prevTx => {
                setTranslateY(prevTy => {
                    // 줌 중심점 기준 translate 보정
                    const ratio = clamped / prev;
                    const newTx = centerX - ratio * (centerX - prevTx);
                    const newTy = centerY - ratio * (centerY - prevTy);
                    const [clampedTx, clampedTy] = clampTranslate(newTx, newTy, clamped);
                    // setTranslateX는 바깥에서 호출되므로 Y만 여기서 설정
                    // 하지만 nested setState는 batching되므로 안전
                    setTranslateX(clampedTx);
                    setTranslateY(clampedTy);
                    return clampedTy; // 이 값은 바로 위의 setTranslateY가 덮어씀
                });
                return prevTx; // placeholder — 위에서 덮어씀
            });
            return clamped;
        });
    }, [minScale, maxScale, clampTranslate]);

    // -- 버튼 줌 (컨테이너 중앙 기준) --
    const zoomIn = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        const cx = container.clientWidth / 2;
        const cy = container.clientHeight / 2;
        applyZoom(scale * (1 + zoomFactor), cx, cy);
    }, [scale, zoomFactor, applyZoom]);

    const zoomOut = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        const cx = container.clientWidth / 2;
        const cy = container.clientHeight / 2;
        const newScale = scale * (1 - zoomFactor);
        if (newScale <= 1) {
            resetZoom();
        } else {
            applyZoom(newScale, cx, cy);
        }
    }, [scale, zoomFactor, applyZoom]);

    const resetZoom = useCallback(() => {
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
    }, []);

    // -- Wheel 줌 (Ctrl/Meta + wheel) --
    // React의 onWheel은 passive라 preventDefault 불가 → DOM 직접 부착
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();

            const rect = container.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;

            const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;

            setScale(prev => {
                const newScale = Math.min(maxScale, Math.max(minScale, prev * (1 + delta)));
                if (newScale <= 1) {
                    setTranslateX(0);
                    setTranslateY(0);
                    return 1;
                }
                setTranslateX(prevTx => {
                    setTranslateY(prevTy => {
                        const ratio = newScale / prev;
                        const newTx = cx - ratio * (cx - prevTx);
                        const newTy = cy - ratio * (cy - prevTy);
                        const w = container.clientWidth;
                        const h = container.clientHeight;
                        const contentW = w * newScale;
                        const contentH = h * newScale;
                        const minTx = -(contentW - w * 0.5);
                        const maxTx2 = w * 0.5;
                        const minTy = -(contentH - h * 0.5);
                        const maxTy2 = h * 0.5;
                        setTranslateX(Math.min(maxTx2, Math.max(minTx, newTx)));
                        setTranslateY(Math.min(maxTy2, Math.max(minTy, newTy)));
                        return prevTy;
                    });
                    return prevTx;
                });
                return newScale;
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [minScale, maxScale, zoomFactor]);

    // -- 두 포인터 간 거리 계산 --
    const getPointerDistance = useCallback((p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }, []);

    // -- 모든 제스처 상태 초기화 --
    const clearGesture = useCallback(() => {
        pointers.current.clear();
        dragStart.current = null;
        pinchStartDist.current = null;
        setIsGesturing(false);
    }, []);

    // -- Pointer 이벤트 핸들러 --
    const onPointerDown = useCallback((e: PointerEvent) => {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        // currentTarget(핸들러가 달린 div)에 캡처 — SVG 자식 요소에 걸면 불안정
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

        if (pointers.current.size === 2) {
            // 핀치 시작
            const pts = Array.from(pointers.current.values());
            pinchStartDist.current = getPointerDistance(pts[0], pts[1]);
            pinchStartScale.current = scale;
            setIsGesturing(true);
        } else if (pointers.current.size === 1 && scale > 1) {
            // 드래그 시작 (줌 상태에서만)
            dragStart.current = { x: e.clientX, y: e.clientY, tx: translateX, ty: translateY };
            setIsGesturing(true);
        }
    }, [scale, translateX, translateY, getPointerDistance]);

    const onPointerMove = useCallback((e: PointerEvent) => {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.current.size === 2 && pinchStartDist.current !== null) {
            // 핀치 줌
            const pts = Array.from(pointers.current.values());
            const dist = getPointerDistance(pts[0], pts[1]);
            const ratio = dist / pinchStartDist.current;
            const newScale = Math.min(maxScale, Math.max(minScale, pinchStartScale.current * ratio));

            const container = containerRef.current;
            if (container) {
                const rect = container.getBoundingClientRect();
                const cx = (pts[0].x + pts[1].x) / 2 - rect.left;
                const cy = (pts[0].y + pts[1].y) / 2 - rect.top;
                applyZoom(newScale, cx, cy);
            }
        } else if (pointers.current.size === 1 && dragStart.current && scale > 1) {
            // 드래그 팬
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            const newTx = dragStart.current.tx + dx;
            const newTy = dragStart.current.ty + dy;
            const [clampedTx, clampedTy] = clampTranslate(newTx, newTy, scale);
            setTranslateX(clampedTx);
            setTranslateY(clampedTy);
        }
    }, [scale, minScale, maxScale, getPointerDistance, applyZoom, clampTranslate]);

    const onPointerUp = useCallback((e: PointerEvent) => {
        pointers.current.delete(e.pointerId);
        if (pointers.current.size < 2) {
            pinchStartDist.current = null;
        }
        if (pointers.current.size === 0) {
            dragStart.current = null;
            setIsGesturing(false);
        }
    }, []);

    const onPointerCancel = useCallback((e: PointerEvent) => {
        pointers.current.delete(e.pointerId);
        if (pointers.current.size === 0) {
            dragStart.current = null;
            pinchStartDist.current = null;
            setIsGesturing(false);
        }
    }, []);

    // 포인터가 영역 밖으로 빠져나가면 드래그/핀치 상태 초기화
    const onPointerLeave = useCallback((_e: PointerEvent) => {
        clearGesture();
    }, [clearGesture]);

    return {
        containerRef,
        scale,
        translateX,
        translateY,
        isZoomed: scale > 1,
        isGesturing,
        zoomIn,
        zoomOut,
        resetZoom,
        handlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
            onPointerLeave,
        },
    };
}
