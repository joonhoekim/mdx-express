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
                    return { default: mod.HelpCircle };
                }
                return { default: IconComponent };
            })
            .catch(() => {
                console.error(`Failed to load icon "${name}"`);
                return import('lucide-react').then((mod) => ({ default: mod.HelpCircle }));
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
 * <Icon name="CheckCircle" color="green" />
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

// 자주 사용하는 아이콘들을 한 곳에서 정의
import {
    Star, Code, Palette, Zap, FileText, ArrowRight,
    Info, AlertTriangle, CheckCircle, XCircle, Lightbulb,
    HelpCircle, ExternalLink, Copy, Check, ChevronRight,
    ChevronLeft, ChevronDown, ChevronUp, X, Menu, Search,
    Home, Settings, User, Mail, Github, Twitter, Linkedin,
    Youtube, Book, BookOpen, Bookmark, Calendar, Clock,
    Download, Upload, Eye, EyeOff, Heart, MessageCircle,
    Share2, ThumbsUp, TrendingUp, Trash2, Edit, Plus,
    Minus, Save, Send, Filter, SortAsc, SortDesc,
    RefreshCw, Loader2, AlertCircle, Lock, Unlock, Key,
    Shield, Bell, BellOff, Globe, Link2, MapPin, Phone,
    Tag, Folder, File, Image, Video, Music, Archive,
    Database, Server, Terminal, Package, Cpu,
    HardDrive, Wifi, WifiOff, Battery, Power, Sun, Moon,
    Cloud, CloudRain, Sunrise, Sunset, Rocket,
} from 'lucide-react';

// MDX에서 사용할 아이콘 맵 (단일 정의)
export const LUCIDE_ICONS = {
    Star, Code, Palette, Zap, FileText, ArrowRight,
    Info, AlertTriangle, CheckCircle, XCircle, Lightbulb,
    HelpCircle, ExternalLink, Copy, Check, ChevronRight,
    ChevronLeft, ChevronDown, ChevronUp, X, Menu, Search,
    Home, Settings, User, Mail, Github, Twitter, Linkedin,
    Youtube, Book, BookOpen, Bookmark, Calendar, Clock,
    Download, Upload, Eye, EyeOff, Heart, MessageCircle,
    Share2, ThumbsUp, TrendingUp, Trash2, Edit, Plus,
    Minus, Save, Send, Filter, SortAsc, SortDesc,
    RefreshCw, Loader2, AlertCircle, Lock, Unlock, Key,
    Shield, Bell, BellOff, Globe, Link2, MapPin, Phone,
    Tag, Folder, File, Image, Video, Music, Archive,
    Database, Server, Terminal, PackageIcon: Package, Cpu,
    HardDrive, Wifi, WifiOff, Battery, Power, Sun, Moon,
    Cloud, CloudRain, Sunrise, Sunset, Rocket,
} as const;

// 개별 re-export (기존 코드 호환)
export {
    Star, Code, Palette, Zap, FileText, ArrowRight,
    Info, AlertTriangle, CheckCircle, XCircle, Lightbulb,
    HelpCircle, ExternalLink, Copy, Check, ChevronRight,
    ChevronLeft, ChevronDown, ChevronUp, X, Menu, Search,
    Home, Settings, User, Mail, Github, Twitter, Linkedin,
    Youtube, Book, BookOpen, Bookmark, Calendar, Clock,
    Download, Upload, Eye, EyeOff, Heart, MessageCircle,
    Share2, ThumbsUp, TrendingUp, Trash2, Edit, Plus,
    Minus, Save, Send, Filter, SortAsc, SortDesc,
    RefreshCw, Loader2, AlertCircle, Lock, Unlock, Key,
    Shield, Bell, BellOff, Globe, Link2, MapPin, Phone,
    Tag, Folder, File, Image as ImageIcon, Video, Music, Archive,
    Database, Server, Terminal, Package, Cpu,
    HardDrive, Wifi, WifiOff, Battery, Power, Sun, Moon,
    Cloud, CloudRain, Sunrise, Sunset, Rocket,
};

