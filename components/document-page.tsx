import { MDXFile, getAdjacentArticles } from '@/lib/mdx-utils';
import { DocumentHeader } from '@/components/document-header';
import { MDXRenderer } from '@/components/mdx-renderer';
import { ArticleNavigation } from '@/components/article-navigation';

interface DocumentPageProps {
    mdxContent: MDXFile;
    slug: string[];
}

export async function DocumentPage({ mdxContent, slug }: DocumentPageProps) {
    const adjacent = await getAdjacentArticles(slug);

    return (
        <div className="space-y-6">
            <DocumentHeader
                title={mdxContent.title}
                description={mdxContent.description}
            />

            <div className="prose prose-slate dark:prose-invert max-w-none">
                <MDXRenderer content={mdxContent.content} />
            </div>

            <ArticleNavigation adjacent={adjacent} />
        </div>
    );
}
