import { notFound } from 'next/navigation';
import {
  getMDXContentByPath,
  getPathType,
  buildMDXTree,
  getAllMDXNestedSections
} from '@/lib/mdx-utils';
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

  // 경로 타입 확인
  const pathType = await getPathType(slug);

  if (pathType === null) {
    notFound();
  }

  if (pathType === 'file') {
    // 파일인 경우: 개별 문서 페이지 렌더링
    const mdxContent = await getMDXContentByPath(slug);

    if (!mdxContent) {
      notFound();
    }

    return <DocumentPage mdxContent={mdxContent} />;
  }

  if (pathType === 'directory') {
    // 디렉토리인 경우: 섹션 인덱스 페이지 렌더링
    const section = slug[slug.length - 1]; // 마지막 디렉토리명을 섹션으로 사용

    // 해당 디렉토리의 파일들 가져오기
    const tree = await buildMDXTree('', slug);

    // 폴더가 비어있어도 접근 가능하도록 처리
    // (빈 폴더도 유효한 카테고리로 간주)

    // 하위 파일들을 기존 형식으로 변환 (SectionIndexPage 호환성 위해)
    const files = tree
      .filter(node => node.type === 'file')
      .map(node => ({
        slug: node.slug,
        title: node.title,
        description: node.description,
        order: node.order || 0,
        path: node.path,
        content: node.content || '',
      }));

    // 하위 디렉토리들 추출
    const directories = tree.filter(node => node.type === 'directory');

    return (
      <SectionIndexPage
        section={section}
        files={files}
        directories={directories}
        currentPath={slug}
      />
    );
  }

  notFound();
}

// generateStaticParams를 사용하여 정적 페이지 생성
export async function generateStaticParams() {
  try {
    const nestedSections = await getAllMDXNestedSections();
    const params: Array<{ slug: string[] }> = [];

    // 재귀적으로 모든 경로 생성
    function collectPaths(nodes: any[], currentPath: string[] = []): void {
      for (const node of nodes) {
        const nodePath = [...currentPath, node.slug];

        if (node.type === 'directory') {
          // 디렉토리 경로 추가
          params.push({
            slug: nodePath,
          });

          // 하위 노드들 재귀적으로 처리
          if (node.children && node.children.length > 0) {
            collectPaths(node.children, nodePath);
          }
        } else if (node.type === 'file') {
          // 파일 경로 추가
          params.push({
            slug: nodePath,
          });
        }
      }
    }

    for (const section of nestedSections) {
      // 섹션 루트 경로
      params.push({
        slug: [section.section],
      });

      // 섹션 내의 모든 파일과 디렉토리 경로 수집
      collectPaths(section.tree, [section.section]);
    }

    return params;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
} 