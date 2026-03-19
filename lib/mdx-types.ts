import path from 'path';

export interface MDXFile {
  slug: string;
  title: string;
  description?: string;
  order?: number;
  path: string;
  content: string;
}

// 중첩된 디렉토리 구조를 지원하는 새로운 인터페이스
export interface MDXFileNode {
  type: 'file' | 'directory';
  name: string;
  slug: string;
  title: string;
  description?: string;
  order?: number;
  path: string;
  content?: string;
  children?: MDXFileNode[];
  fullPath: string[]; // 전체 경로 배열 (예: ['guides', 'frontend', 'react'])
}

// 섹션 인터페이스 - 중첩 구조 지원
export interface MDXNestedSection {
  section: string;
  tree: MDXFileNode[];
}

// MDX 파일의 frontmatter 타입
export interface MDXFrontmatter {
  title: string;
  description?: string;
  order?: number;
  author?: string;
  date?: string;
  tags?: string[];
  [key: string]: unknown;
}

// 인접 글 (이전/다음) 조회
export interface AdjacentArticle {
  title: string;
  href: string;
}

export interface AdjacentArticles {
  prev: AdjacentArticle | null;
  next: AdjacentArticle | null;
}

// 컨텐츠 디렉토리 경로
export const CONTENT_DIR = path.join(process.cwd(), 'content');
