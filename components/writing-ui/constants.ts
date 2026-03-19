/** Callout 타입별 스타일 (Tailwind 클래스) */
export const CALLOUT_STYLES = {
    info: {
        container: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100'
    },
    warning: {
        container: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-100',
        icon: 'text-yellow-600 dark:text-yellow-400',
        title: 'text-yellow-900 dark:text-yellow-100'
    },
    error: {
        container: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-100'
    },
    success: {
        container: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/30 dark:text-green-100',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-100'
    },
    note: {
        container: 'border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100',
        icon: 'text-gray-600 dark:text-gray-400',
        title: 'text-gray-900 dark:text-gray-100'
    }
}

/** Reference 타입별 색상 (Tailwind 클래스) */
export const REFERENCE_COLORS = {
    article: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
    documentation: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30',
    tutorial: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30',
    reference: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30',
    link: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/30'
}

/** MugongCard 카테고리별 스타일 (Tailwind 클래스) */
export const MUGONG_CATEGORY_STYLES: Record<string, { badge: string; border: string; bg: string }> = {
    '백엔드': {
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        bg: 'bg-green-50/50 dark:bg-green-950/20',
    },
    '프론트엔드': {
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    },
    'SSR/풀스택': {
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        bg: 'bg-purple-50/50 dark:bg-purple-950/20',
    },
    '모바일': {
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        bg: 'bg-orange-50/50 dark:bg-orange-950/20',
    },
    'DB': {
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    },
    'DevOps': {
        badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
        border: 'border-teal-200 dark:border-teal-800',
        bg: 'bg-teal-50/50 dark:bg-teal-950/20',
    },
    'AI': {
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        bg: 'bg-rose-50/50 dark:bg-rose-950/20',
    },
}

/** MugongCard 기본 스타일 (카테고리 미지정 시) */
export const MUGONG_DEFAULT_STYLE = {
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    bg: 'bg-gray-50/50 dark:bg-gray-950/20',
}

/** 코드 블록 언어 → highlight.js 언어 별칭 */
export const LANGUAGE_ALIASES: Record<string, string> = {
    'mdx': 'markdown',
    'md': 'markdown',
    'vue': 'html',
    'svelte': 'html',
};

/** 코드 블록 언어별 뱃지 색상 (Tailwind 클래스) */
export const LANGUAGE_BADGE_COLORS: Record<string, string> = {
    'typescript': 'bg-blue-500/20 text-blue-400',
    'ts': 'bg-blue-500/20 text-blue-400',
    'tsx': 'bg-blue-500/20 text-blue-400',
    'javascript': 'bg-yellow-500/20 text-yellow-400',
    'js': 'bg-yellow-500/20 text-yellow-400',
    'jsx': 'bg-yellow-500/20 text-yellow-400',
    'python': 'bg-green-500/20 text-green-400',
    'py': 'bg-green-500/20 text-green-400',
    'css': 'bg-pink-500/20 text-pink-400',
    'scss': 'bg-pink-500/20 text-pink-400',
    'html': 'bg-orange-500/20 text-orange-400',
    'bash': 'bg-emerald-500/20 text-emerald-400',
    'sh': 'bg-emerald-500/20 text-emerald-400',
    'shell': 'bg-emerald-500/20 text-emerald-400',
    'json': 'bg-amber-500/20 text-amber-400',
    'yaml': 'bg-red-500/20 text-red-400',
    'yml': 'bg-red-500/20 text-red-400',
    'rust': 'bg-orange-600/20 text-orange-400',
    'go': 'bg-cyan-500/20 text-cyan-400',
};
