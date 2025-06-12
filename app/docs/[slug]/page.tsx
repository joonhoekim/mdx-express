import { notFound } from 'next/navigation';
import { getMDXContent, getAllMDXSections } from '@/lib/mdx-utils';
import { MDXRenderer } from '@/components/mdx-renderer';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = params;
  
  // URL 형태: /docs/dashboard-getting-started
  const [section, ...slugParts] = slug.split('-');
  const actualSlug = slugParts.join('-');
  
  if (!section || !actualSlug) {
    notFound();
  }
  
  const mdxContent = await getMDXContent(section, actualSlug);

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

// generateStaticParams를 사용하여 정적 페이지 생성
export async function generateStaticParams() {
  try {
    const sections = await getAllMDXSections();
    const params: Array<{ slug: string }> = [];
    
    for (const section of sections) {
      for (const file of section.files) {
        params.push({
          slug: `${section.section}-${file.slug}`,
        });
      }
    }
    
    return params;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
} 