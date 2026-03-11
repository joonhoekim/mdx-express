import { getAllMDXNestedSections } from '@/lib/mdx-utils';
import { formatTitle } from '@/lib/utils';
import { buildDocsPath } from '@/lib/build-docs-path';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, ArrowRight, Folder, FileText } from 'lucide-react';

export default async function DocsIndexPage() {
  const sections = await getAllMDXNestedSections();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">블로그</h1>
        <p className="text-xl text-muted-foreground">
          프로젝트 문서를 탐색하고 필요한 정보를 찾아보세요.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const items = section.tree.filter(node => node.slug !== 'index');
          const fileCount = items.filter(n => n.type === 'file').length;
          const dirCount = items.filter(n => n.type === 'directory').length;
          const countParts = [];
          if (dirCount > 0) countParts.push(`${dirCount}개의 카테고리`);
          if (fileCount > 0) countParts.push(`${fileCount}개의 문서`);
          const countText = countParts.length > 0 ? countParts.join('와 ') + '가 있습니다' : '아직 항목이 없습니다';

          return (
            <Card key={section.section} className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {formatTitle(section.section)}
                </CardTitle>
                <CardDescription>
                  {countText}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.slice(0, 3).map((node) => {
                    const Icon = node.type === 'directory' ? Folder : FileText;
                    return (
                      <Link
                        key={node.slug}
                        href={buildDocsPath(section.section, node.slug)}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          {node.title}
                        </span>
                        <ArrowRight className="h-4 w-4 opacity-50" />
                      </Link>
                    );
                  })}
                  {items.length > 3 && (
                    <Link
                      href={buildDocsPath(section.section)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
                    >
                      <span>더 보기 ({items.length - 3}개)</span>
                      <ArrowRight className="h-4 w-4 opacity-50" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
