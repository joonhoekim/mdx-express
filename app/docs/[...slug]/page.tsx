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

  let section: string;
  let filename: string;

  if (slug.length === 1) {
    // URL 형태: /docs/dashboard-getting-started (기존 호환성)
    const [sectionPart, ...filenameParts] = slug[0].split('-');
    section = sectionPart;
    filename = filenameParts.join('-');
  } else if (slug.length === 2) {
    // URL 형태: /docs/dashboard/getting-started (새로운 구조)
    [section, filename] = slug;
  } else {
    notFound();
  }
  
  if (!section || !filename) {
    notFound();
  }
  
  const mdxContent = await getMDXContent(section, filename);

  if (!mdxContent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation />
      
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

// generateStaticParams를 사용하여 정적 페이지 생성
export async function generateStaticParams() {
  try {
    const sections = await getAllMDXSections();
    const params: Array<{ slug: string[] }> = [];
    
    for (const section of sections) {
      for (const file of section.files) {
        // 새로운 구조: /docs/section/filename
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