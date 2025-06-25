import { notFound } from 'next/navigation';
import { getMDXFiles, getAllMDXSections } from '@/lib/mdx-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FileText, Clock, ArrowRight } from 'lucide-react';

interface PageProps {
  params: {
    section: string;
  };
}

export default async function SectionIndexPage({ params }: PageProps) {
  const { section } = await params;
  
  const files = await getMDXFiles(section);
  
  if (files.length === 0) {
    notFound();
  }

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

// generateStaticParams를 사용하여 정적 페이지 생성
export async function generateStaticParams() {
  try {
    const sections = await getAllMDXSections();
    return sections.map((section) => ({
      section: section.section,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
} 