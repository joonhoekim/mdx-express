import { getAllMDXSections } from '@/lib/mdx-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

export default async function DocsIndexPage() {
  const sections = await getAllMDXSections();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">문서</h1>
        <p className="text-xl text-muted-foreground">
          프로젝트 문서를 탐색하고 필요한 정보를 찾아보세요.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.section} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {section.section.charAt(0).toUpperCase() + section.section.slice(1)}
              </CardTitle>
              <CardDescription>
                {section.files.length}개의 문서가 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.files.slice(0, 3).map((file) => (
                  <Link
                    key={file.slug}
                    href={`/docs/${section.section}/${file.slug}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{file.title}</span>
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </Link>
                ))}
                {section.files.length > 3 && (
                  <Link
                    href={`/docs/${section.section}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
                  >
                    <span>더 보기 ({section.files.length - 3}개)</span>
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">문서가 없습니다</h3>
          <p className="text-muted-foreground">
            아직 생성된 문서가 없습니다. content 폴더에 MDX 파일을 추가해주세요.
          </p>
        </div>
      )}
    </div>
  );
} 