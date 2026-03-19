'use client';

import { useMemo } from 'react';

interface FloatingBubblesProps {
    count?: number;
}

export function FloatingBubbles({ count = 20 }: FloatingBubblesProps) {
    const bubbles = useMemo(
        () =>
            Array.from({ length: count }, () => ({
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 20}px`,
                height: `${Math.random() * 100 + 20}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
            })),
        [count],
    );

    return (
        <div className="absolute inset-0 overflow-hidden">
            {bubbles.map((style, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-blue-200/20 dark:bg-blue-400/10 animate-float"
                    style={style}
                />
            ))}

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                .animate-float {
                    animation: float linear infinite;
                }
            `}</style>
        </div>
    );
}
