import path from 'path';
import { MDXFile, getAdjacentArticles } from '@/lib/mdx-utils';
import { CONTENT_DIR } from '@/lib/mdx-types';
import { getGitMetadata } from '@/lib/git-metadata';
import { DocumentHeader } from '@/components/document-header';
import { compileDocument } from '@/components/mdx-renderer';
import { TableOfContents } from '@/components/table-of-contents';
import { ArticleNavigation } from '@/components/article-navigation';

interface DocumentPageProps {
    mdxContent: MDXFile;
    slug: string[];
}

export async function DocumentPage({ mdxContent, slug }: DocumentPageProps) {
    const adjacent = await getAdjacentArticles(slug);
    const git = getGitMetadata(path.join(CONTENT_DIR, mdxContent.path));
    const { node, headings } = await compileDocument(mdxContent.content);

    return (
        <div className="relative">
            <div className="space-y-6">
                <DocumentHeader
                    title={mdxContent.title}
                    subtitle={mdxContent.subtitle}
                    tags={mdxContent.tags}
                    git={git}
                />

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    {node}
                </div>

                <ArticleNavigation adjacent={adjacent} />
            </div>

            {/* 우측 여백(gutter)에 목차를 띄운다. 본문 폭은 유지되고,
                여백이 충분히 넓을 때(min-[1700px])만 표시된다. */}
            <div className="absolute left-full top-0 hidden h-full pl-10 min-[1700px]:block">
                <TableOfContents headings={headings} />
            </div>
        </div>
    );
}
