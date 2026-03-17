import { MDXFileNode } from '@/lib/mdx-utils';
import { formatTitle } from '@/lib/utils';
import { buildDocsPath } from '@/lib/build-docs-path';
import { DocumentHeader } from '@/components/document-header';
import { FileCard } from '@/components/file-card';

interface SectionIndexPageProps {
    section: string;
    items: MDXFileNode[];
    currentPath: string[];
}

export function SectionIndexPage({ section, items, currentPath }: SectionIndexPageProps) {
    const sectionTitle = formatTitle(section);

    const directories = items.filter(n => n.type === 'directory');
    const files = items.filter(n => n.type === 'file');
    const totalCount = directories.length + files.length;

    const sectionDescription = totalCount > 0
        ? `${directories.length}개의 카테고리와 ${files.length}개의 문서가 있습니다`
        : '아직 문서가 없습니다';

    return (
        <div className="space-y-6">
            <DocumentHeader
                title={sectionTitle}
                description={sectionDescription}
                size="large"
            />

            {totalCount > 0 ? (
                <div className="grid gap-2">
                    {directories.map((directory) => (
                        <FileCard
                            key={directory.slug}
                            title={directory.title}
                            description={directory.description || `${directory.children?.length || 0}개의 하위 항목`}
                            href={buildDocsPath(...currentPath, directory.slug)}
                            isDirectory={true}
                        />
                    ))}

                    {files.map((file) => (
                        <FileCard
                            key={file.slug}
                            title={file.title}
                            description={file.description}
                            href={buildDocsPath(...currentPath, file.slug)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">이 카테고리에는 아직 문서가 없습니다.</p>
                    <p className="text-sm mt-2">새로운 문서가 추가되면 여기에 표시됩니다.</p>
                </div>
            )}
        </div>
    );
}
