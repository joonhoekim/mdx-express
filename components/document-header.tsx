import { Calendar, RefreshCw, User } from 'lucide-react';
import type { GitMetadata } from '@/lib/git-metadata';

interface DocumentHeaderProps {
    title: string;
    description?: string;
    size?: 'large' | 'medium';
    tags?: string[];
    git?: GitMetadata;
}

// git의 --date=short 출력은 이미 YYYY-MM-DD (ISO 표준) → 별도 포맷팅 불필요

export function DocumentHeader({ title, description, size = 'medium', tags, git }: DocumentHeaderProps) {
    const hasGitMeta = git && (git.author || git.created || git.updated);
    const showUpdated = git?.updated && git.updated !== git.created;

    return (
        <div className="space-y-3">
            <h1 className={size === 'large' ? 'text-4xl font-bold' : 'text-3xl font-bold'}>
                {title}
            </h1>
            {description && (
                <p className={`text-muted-foreground ${size === 'large' ? 'text-xl' : 'text-lg'}`}>
                    {description}
                </p>
            )}
            {hasGitMeta && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {git.author && (
                        <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {git.author}
                        </span>
                    )}
                    {git.created && (
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {git.created}
                        </span>
                    )}
                    {showUpdated && (
                        <span className="flex items-center gap-1">
                            <RefreshCw className="h-3.5 w-3.5" />
                            {git.updated}
                        </span>
                    )}
                </div>
            )}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
