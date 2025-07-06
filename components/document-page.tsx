import { MDXFile } from '@/lib/mdx-utils';
import { DocumentHeader } from '@/components/document-header';
import { MDXRenderer } from '@/components/mdx-renderer';

interface DocumentPageProps {
    mdxContent: MDXFile;
}

export function DocumentPage({ mdxContent }: DocumentPageProps) {
    return (
        <div className="space-y-6">
            <DocumentHeader
                title={mdxContent.title}
                description={mdxContent.description}
            />

            <div className="prose prose-slate dark:prose-invert max-w-none">
                <MDXRenderer content={mdxContent.content} />
            </div>
        </div>
    );
} 