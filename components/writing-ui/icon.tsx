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
                    // 폴백: HelpCircle 아이콘
                    return { default: mod.HelpCircle };
                }
                return { default: IconComponent };
            })
            .catch(() => {
                console.error(`Failed to load icon "${name}"`);
                // 에러 시 폴백
                return import('lucide-react').then((mod) => ({ default: mod.HelpCircle }));
            })
    );
};

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
    const IconComponent = loadIcon(name);

    return (
        <Suspense fallback={<div className={cn('inline-block', className)} style={{ width: size, height: size }} />}>
            <IconComponent className={className} size={size} {...props} />
        </Suspense>
    );
}

// 자주 사용하는 아이콘들은 미리 export (트리 쉐이킹 최적화)
export {
    Star,
    Code,
    Palette,
    Zap,
    FileText,
    ArrowRight,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Lightbulb,
    HelpCircle,
    ExternalLink,
    Copy,
    Check,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    X,
    Menu,
    Search,
    Home,
    Settings,
    User,
    Mail,
    Github,
    Twitter,
    Linkedin,
    Youtube,
    Book,
    BookOpen,
    Bookmark,
    Calendar,
    Clock,
    Download,
    Upload,
    Eye,
    EyeOff,
    Heart,
    MessageCircle,
    Share2,
    ThumbsUp,
    TrendingUp,
    Trash2,
    Edit,
    Plus,
    Minus,
    Save,
    Send,
    Filter,
    SortAsc,
    SortDesc,
    RefreshCw,
    Loader2,
    AlertCircle,
    Lock,
    Unlock,
    Key,
    Shield,
    Bell,
    BellOff,
    Globe,
    Link2,
    MapPin,
    Phone,
    Tag,
    Folder,
    File,
    Image as ImageIcon,
    Video,
    Music,
    Archive,
    Database,
    Server,
    Terminal,
    Package,
    Cpu,
    HardDrive,
    Wifi,
    WifiOff,
    Battery,
    Power,
    Sun,
    Moon,
    Cloud,
    CloudRain,
    Sunrise,
    Sunset,
    Rocket,
} from 'lucide-react';

