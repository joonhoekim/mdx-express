'use client';

import { useState, useEffect } from 'react';

export function CursorFollower() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className="fixed pointer-events-none z-10 transition-all duration-300 ease-out"
            style={{
                left: mousePosition.x - 10,
                top: mousePosition.y - 10,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <div className="w-5 h-5 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
        </div>
    );
}
