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
    const sectionTitle = formatTitle(section) + ' 문서';

    const directories = items.filter(n => n.type === 'directory');
    const files = items.filter(n => n.type === 'file' && n.slug !== 'index');
    const totalCount = directories.length + files.length;

    const sectionDescription = totalCount > 0
        ? `${directories.length}개의 카테고리와 ${files.length}개의 문서가 있습니다`
        : '아직 문서가 없습니다';

    return (
        <div className="space-y-8">
            <DocumentHeader
                title={sectionTitle}
                description={sectionDescription}
                size="large"
            />

            <div className="grid gap-6">
                {totalCount > 0 ? (
                    <>
                        {/* 디렉토리들 먼저 표시 */}
                        {directories.map((directory) => (
                            <FileCard
                                key={directory.slug}
                                title={directory.title}
                                description={directory.description || `${directory.children?.length || 0}개의 하위 항목`}
                                order={directory.order}
                                href={buildDocsPath(...currentPath, directory.slug)}
                                isDirectory={true}
                            />
                        ))}

                        {/* 파일들 표시 */}
                        {files.map((file) => (
                            <FileCard
                                key={file.slug}
                                title={file.title}
                                description={file.description}
                                order={file.order}
                                href={buildDocsPath(...currentPath, file.slug)}
                            />
                        ))}
                    </>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">이 카테고리에는 아직 문서가 없습니다.</p>
                        <p className="text-sm mt-2">새로운 문서가 추가되면 여기에 표시됩니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
