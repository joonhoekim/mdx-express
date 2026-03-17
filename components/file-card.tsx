import Link from 'next/link';
import { FileText, ChevronRight, Folder } from 'lucide-react';

interface FileCardProps {
    title: string;
    description?: string;
    href: string;
    isDirectory?: boolean;
}

export function FileCard({
    title,
    description,
    href,
    isDirectory = false
}: FileCardProps) {
    const Icon = isDirectory ? Folder : FileText;

    return (
        <Link href={href} className="group block">
            <div className="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/50">
                <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-snug">{title}</p>
                    {description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{description}</p>
                    )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
        </Link>
    );
}
