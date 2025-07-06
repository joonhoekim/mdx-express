import { notFound } from 'next/navigation';
import { getMDXContent, getMDXFiles, getAllMDXSections } from '@/lib/mdx-utils';
import { SectionIndexPage } from '@/components/section-index-page';
import { DocumentPage } from '@/components/document-page';

interface PageProps {
  params: {
    slug: string[];
  };
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;

  // slug가 비어있으면 404
  if (!slug || slug.length === 0) {
    notFound();
  }

  // 섹션 인덱스 페이지 처리 (slug.length === 1)
  if (slug.length === 1) {
    const section = slug[0];

    // 기존 호환성을 위한 하이픈 처리
    if (section.includes('-')) {
      const [sectionPart, ...filenameParts] = section.split('-');
      const filename = filenameParts.join('-');

      if (sectionPart && filename) {
        const mdxContent = await getMDXContent(sectionPart, filename);
        if (mdxContent) {
          return <DocumentPage mdxContent={mdxContent} />;
        }
      }
    }

    // 섹션 인덱스 페이지 렌더링
    const files = await getMDXFiles(section);
    if (files.length === 0) {
      notFound();
    }

    return <SectionIndexPage section={section} files={files} />;
  }

  // 개별 문서 페이지 처리 (slug.length === 2)
  if (slug.length === 2) {
    const [section, filename] = slug;
    const mdxContent = await getMDXContent(section, filename);

    if (!mdxContent) {
      notFound();
    }

    return <DocumentPage mdxContent={mdxContent} />;
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