import { MDXFile } from '@/lib/mdx-utils';
import { DocumentHeader } from '@/components/document-header';
import { FileCard } from '@/components/file-card';

interface SectionIndexPageProps {
    section: string;
    files: MDXFile[];
}

export function SectionIndexPage({ section, files }: SectionIndexPageProps) {
    const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1) + ' 문서';
    const sectionDescription = `${files.length}개의 문서가 있습니다`;

    return (
        <div className="space-y-8">
            <DocumentHeader
                title={sectionTitle}
                description={sectionDescription}
                size="large"
            />

            <div className="grid gap-6">
                {files.map((file) => (
                    <FileCard
                        key={file.slug}
                        title={file.title}
                        description={file.description}
                        order={file.order}
                        href={`/docs/${section}/${file.slug}`}
                    />
                ))}
            </div>
        </div>
    );
} 