'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps extends Omit<LucideProps, 'ref'> {
    name: string;
    className?: string;
}

// 아이콘을 동적으로 import하는 함수
const loadIcon = (name: string): ComponentType<LucideProps> => {
    return lazy(() =>
        import('lucide-react')
            .then((mod) => {
                const IconComponent = (mod as any)[name];
                if (!IconComponent) {
                    console.warn(`Icon "${name}" not found in lucide-react. Using fallback.`);
                    return { default: mod.CircleHelp };
                }
                return { default: IconComponent };
            })
            .catch(() => {
                console.error(`Failed to load icon "${name}"`);
                return import('lucide-react').then((mod) => ({ default: mod.CircleHelp }));
            })
    );
};

// 모듈 레벨 캐시: 동일 name에 대해 항상 같은 lazy 컴포넌트 참조를 반환
const iconCache = new Map<string, ComponentType<LucideProps>>();

function getOrLoadIcon(name: string): ComponentType<LucideProps> {
    let cached = iconCache.get(name);
    if (!cached) {
        cached = loadIcon(name);
        iconCache.set(name, cached);
    }
    return cached;
}

/**
 * 동적 Icon 컴포넌트
 *
 * Lucide React 아이콘을 동적으로 로드하여 사용합니다.
 * MDX에서 import 없이 사용할 수 있습니다.
 *
 * @example
 * ```mdx
 * <Icon name="Star" className="h-5 w-5 text-yellow-500" />
 * <Icon name="ArrowRight" size={24} />
 * <Icon name="CircleCheckBig" color="green" />
 * ```
 */
export function Icon({ name, className, size = 24, ...props }: IconProps) {
    const IconComponent = getOrLoadIcon(name);

    return (
        <Suspense fallback={<div className={cn('inline-block', className)} style={{ width: size, height: size }} />}>
            <IconComponent className={className} size={size} {...props} />
        </Suspense>
    );
}
