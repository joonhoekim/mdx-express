'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FloatingBubbles } from './_components/floating-bubbles';
import { CursorFollower } from './_components/cursor-follower';

export default function NotFound() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentTip, setCurrentTip] = useState(0);

    const tips = [
        "💡 URL을 다시 확인해보세요",
        "🔍 검색 기능을 사용해보세요",
        "📚 문서 목록에서 찾아보세요",
        "🏠 홈페이지로 돌아가보세요",
        "⏰ 잠시 후 다시 시도해보세요"
    ];

    const funnyMessages = [
        "앗! 여기는 디지털 사막이에요 🏜️",
        "404: 페이지가 휴가를 떠났습니다 🏖️",
        "이 페이지는 숨바꼴질의 달인입니다 🙈",
        "페이지가 다른 차원으로 이동했어요 🌌",
        "여기는... 아무것도 없는 곳이에요 👻"
    ];

    const [currentMessage, setCurrentMessage] = useState(0);

    useEffect(() => {
        setIsVisible(true);

        const tipInterval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % tips.length);
        }, 3000);

        const messageInterval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % funnyMessages.length);
        }, 4000);

        return () => {
            clearInterval(tipInterval);
            clearInterval(messageInterval);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
            <FloatingBubbles />
            <CursorFollower />

            <div className={`max-w-2xl w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl">
                    <CardHeader className="text-center pb-4">
                        <div className="relative mb-6">
                            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                                404
                            </div>
                            <div className="absolute -top-4 -right-4 animate-bounce">
                                <Badge variant="destructive" className="text-xs">
                                    NOT FOUND
                                </Badge>
                            </div>
                        </div>

                        <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                            {funnyMessages[currentMessage]}
                        </CardTitle>

                        <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                            찾으시는 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 border border-blue-200 dark:border-slate-500">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    💡 도움말
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    {currentTip + 1}/{tips.length}
                                </Badge>
                            </div>
                            <p className="text-sm text-blue-600 dark:text-blue-200 transition-all duration-500">
                                {tips[currentTip]}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/docs" className="group">
                                <Button
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                                >
                                    <span className="mr-2">📚</span>
                                    문서 둘러보기
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </Button>
                            </Link>

                            <Link href="/" className="group">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 border-2 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300 group-hover:scale-105"
                                >
                                    <span className="mr-2">🏠</span>
                                    홈으로 돌아가기
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </Button>
                            </Link>
                        </div>

                        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-600">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                문제가 지속되면 다음을 시도해보세요:
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    브라우저 새로고침
                                </Badge>
                                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    캐시 삭제
                                </Badge>
                                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    URL 확인
                                </Badge>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                🎯 재미있는 사실
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                404 오류는 1990년대부터 사용되기 시작했어요!
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>Made with</span>
                        <span className="text-red-500 animate-pulse">❤️</span>
                        <span>by MDX Express</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
