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
