import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight, Folder } from 'lucide-react';

interface FileCardProps {
    title: string;
    description?: string;
    order?: number;
    href: string;
    linkText?: string;
    isDirectory?: boolean;
}

export function FileCard({
    title,
    description,
    order,
    href,
    linkText,
    isDirectory = false
}: FileCardProps) {
    const defaultLinkText = isDirectory ? '카테고리 열기' : '문서 읽기';
    const finalLinkText = linkText || defaultLinkText;
    const Icon = isDirectory ? Folder : FileText;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription>{description}</CardDescription>
                        )}
                    </div>
                    {order !== undefined && (
                        <Badge variant="secondary">#{order}</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Link
                    href={href}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                    <span className="font-medium">{finalLinkText}</span>
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </CardContent>
        </Card>
    );
} 