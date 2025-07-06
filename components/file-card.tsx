import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight } from 'lucide-react';

interface FileCardProps {
    title: string;
    description?: string;
    order?: number;
    href: string;
    linkText?: string;
}

export function FileCard({
    title,
    description,
    order,
    href,
    linkText = '문서 읽기'
}: FileCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
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
                    <span className="font-medium">{linkText}</span>
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </CardContent>
        </Card>
    );
} 