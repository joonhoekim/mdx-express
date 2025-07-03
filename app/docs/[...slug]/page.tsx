import { notFound } from 'next/navigation';
import { getMDXContent, getAllMDXSections } from '@/lib/mdx-utils';
import { MDXRenderer } from '@/components/mdx-renderer';
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation';

interface PageProps {
  params: {
    slug: string[];
  };
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;

  // slug가 비어있으면 첫 번째 문서로 리다이렉트
  if (!slug || slug.length === 0) {
    notFound();
  }

  // 섹션 인덱스 페이지 처리 (slug.length === 1인 경우)
  if (slug.length === 1) {
    const section = slug[0];

    // 하이픈이 포함된 경우 기존 호환성 처리
    if (section.includes('-')) {
      const [sectionPart, ...filenameParts] = section.split('-');
      const filename = filenameParts.join('-');

      if (sectionPart && filename) {
        const mdxContent = await getMDXContent(sectionPart, filename);
        if (mdxContent) {
          return (
            <div className="space-y-6">

              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{mdxContent.title}</h1>
                {mdxContent.description && (
                  <p className="text-lg text-muted-foreground">{mdxContent.description}</p>
                )}
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <MDXRenderer content={mdxContent.content} />
              </div>
            </div>
          );
        }
      }
    }

    // 섹션 인덱스 페이지 렌더링
    const { getMDXFiles } = await import('@/lib/mdx-utils');
    const files = await getMDXFiles(section);

    if (files.length === 0) {
      notFound();
    }

    const { Card, CardContent, CardDescription, CardHeader, CardTitle } = await import('@/components/ui/card');
    const { Badge } = await import('@/components/ui/badge');
    const Link = (await import('next/link')).default;
    const { FileText, ArrowRight } = await import('lucide-react');

    return (
      <div className="space-y-8">

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            {section.charAt(0).toUpperCase() + section.slice(1)} 문서
          </h1>
          <p className="text-xl text-muted-foreground">
            {files.length}개의 문서가 있습니다
          </p>
        </div>

        <div className="grid gap-6">
          {files.map((file) => (
            <Card key={file.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {file.title}
                    </CardTitle>
                    {file.description && (
                      <CardDescription>{file.description}</CardDescription>
                    )}
                  </div>
                  {file.order !== undefined && (
                    <Badge variant="secondary">#{file.order}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/docs/${section}/${file.slug}`}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="font-medium">문서 읽기</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 개별 문서 페이지 처리 (slug.length === 2인 경우)
  if (slug.length === 2) {
    const [section, filename] = slug;

    const mdxContent = await getMDXContent(section, filename);

    if (!mdxContent) {
      notFound();
    }

    return (
      <div className="space-y-6">

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{mdxContent.title}</h1>
          {mdxContent.description && (
            <p className="text-lg text-muted-foreground">{mdxContent.description}</p>
          )}
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <MDXRenderer content={mdxContent.content} />
        </div>
      </div>
    );
  }

  // 그 외의 경우는 404
  notFound();
}

// generateStaticParams를 사용하여 정적 페이지 생성
export async function generateStaticParams() {
  try {
    const sections = await getAllMDXSections();
    const params: Array<{ slug: string[] }> = [];

    for (const section of sections) {
      // 섹션 인덱스 페이지: /docs/section
      params.push({
        slug: [section.section],
      });

      // 개별 문서 페이지: /docs/section/filename
      for (const file of section.files) {
        params.push({
          slug: [section.section, file.slug],
        });

        // 기존 호환성을 위한 구조: /docs/section-filename
        params.push({
          slug: [`${section.section}-${file.slug}`],
        });
      }
    }

    return params;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
} 