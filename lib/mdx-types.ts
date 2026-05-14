import path from 'path';
import type { GitMetadata } from './git-metadata';

export type { GitMetadata };

export interface MDXFile {
  slug: string;
  title: string;
  subtitle?: string;    // 부제 — 제목 아래 표시되는 편집적 한 줄
  description?: string; // 설명 — 이 문서가 무엇을 다루는지. SEO 메타 / 섹션 인덱스 카드용
  order?: number;
  tags?: string[];
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
// author/date는 git에서 자동 관리 → frontmatter에 작성해도 무시됨
// subtitle = 부제(편집적 한 줄), description = 설명(이 문서가 무엇을 다루는지 — SEO/인덱스용)
export interface MDXFrontmatter {
  title?: string;
  subtitle?: string;
  description?: string;
  order?: number;
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
