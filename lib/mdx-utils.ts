'use server';

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NavigationItem } from './navigation';

export interface MDXFile {
  slug: string;
  title: string;
  description?: string;
  order?: number;
  path: string;
  content: string;
}

export interface MDXSection {
  section: string;
  files: MDXFile[];
}

// MDX 파일의 frontmatter 타입
export interface MDXFrontmatter {
  title: string;
  description?: string;
  order?: number;
  [key: string]: any;
}

// 컨텐츠 디렉토리 경로
const CONTENT_DIR = path.join(process.cwd(), 'content');

// 디렉토리 생성 (없으면) - 비동기 버전으로 변경
export async function ensureContentDirectory(): Promise<void> {
  try {
    await fs.access(CONTENT_DIR);
  } catch {
    // 디렉토리가 없으면 생성
    await fs.mkdir(CONTENT_DIR, { recursive: true });
  }
}

// MDX 파일 읽기 - 서버 액션
export async function getMDXFile(filePath: string): Promise<MDXFile | null> {
  try {
    const fullPath = path.join(CONTENT_DIR, filePath);
    
    // 파일 존재 여부 확인
    try {
      await fs.access(fullPath);
    } catch {
      return null;
    }
    
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const frontmatter = data as MDXFrontmatter;
    
    return {
      slug: path.basename(filePath, '.mdx'),
      title: frontmatter.title || path.basename(filePath, '.mdx'),
      description: frontmatter.description,
      order: frontmatter.order || 0,
      path: filePath,
      content,
    };
  } catch (error) {
    console.error(`Error reading MDX file ${filePath}:`, error);
    return null;
  }
}

// 특정 섹션의 모든 MDX 파일 가져오기 - 서버 액션
export async function getMDXFiles(sectionPath: string): Promise<MDXFile[]> {
  try {
    const fullPath = path.join(CONTENT_DIR, sectionPath);
    
    // 디렉토리 존재 여부 확인
    try {
      await fs.access(fullPath);
    } catch {
      return [];
    }
    
    const files = await fs.readdir(fullPath);
    const mdxFiles: MDXFile[] = [];
    
    for (const file of files) {
      if (file.endsWith('.mdx')) {
        const filePath = path.join(sectionPath, file);
        const mdxFile = await getMDXFile(filePath);
        if (mdxFile) {
          mdxFiles.push(mdxFile);
        }
      }
    }
    
    // order 필드에 따라 정렬
    return mdxFiles.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error(`Error reading MDX files from ${sectionPath}:`, error);
    return [];
  }
}

// 모든 섹션의 MDX 파일들 가져오기 - 서버 액션
export async function getAllMDXSections(): Promise<MDXSection[]> {
  try {
    await ensureContentDirectory();
    
    // 디렉토리 존재 여부 확인
    try {
      await fs.access(CONTENT_DIR);
    } catch {
      return [];
    }
    
    const dirents = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    const sections = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    const result: MDXSection[] = [];
    for (const section of sections) {
      const files = await getMDXFiles(section);
      result.push({ section, files });
    }
    
    return result;
  } catch (error) {
    console.error('Error reading MDX sections:', error);
    return [];
  }
}

// MDX 파일들을 네비게이션 아이템으로 변환 - 서버 액션
export async function mdxFilesToNavigationItems(
  sectionPath: string,
  baseHref: string
): Promise<NavigationItem[]> {
  const files = await getMDXFiles(sectionPath);
  
  return files.map(file => ({
    title: file.title,
    href: `${baseHref}/${sectionPath}-${file.slug}`,
  }));
}

// 섹션별로 네비게이션 아이템 생성 - 서버 액션
export async function generateMDXNavigation(pathname: string): Promise<NavigationItem[]> {
  // 현재 경로에서 섹션 추출
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return [];
  
  // 현재 섹션 결정 (예: /dashboard -> dashboard)
  const currentSection = pathSegments[0];
  
  // 해당 섹션의 MDX 파일들 가져오기
  const mdxItems = await mdxFilesToNavigationItems(
    currentSection,
    '/docs'
  );
  
  return mdxItems;
}

// 특정 MDX 파일의 내용 가져오기 (동적 라우팅용) - 서버 액션
export async function getMDXContent(section: string, slug: string): Promise<MDXFile | null> {
  const filePath = path.join(section, `${slug}.mdx`);
  return await getMDXFile(filePath);
}

// 새로운 MDX 파일 생성 - 서버 액션 (IDE에서 사용 가능)
export async function createMDXFile(
  section: string, 
  slug: string, 
  frontmatter: MDXFrontmatter, 
  content: string
): Promise<boolean> {
  try {
    await ensureContentDirectory();
    
    const sectionDir = path.join(CONTENT_DIR, section);
    
    // 섹션 디렉토리 생성 (비동기)
    try {
      await fs.access(sectionDir);
    } catch {
      await fs.mkdir(sectionDir, { recursive: true });
    }
    
    const filePath = path.join(sectionDir, `${slug}.mdx`);
    const frontmatterString = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: "${value}"`)
      .join('\n');
    
    const fileContent = `---\n${frontmatterString}\n---\n\n${content}`;
    
    await fs.writeFile(filePath, fileContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error creating MDX file ${section}/${slug}:`, error);
    return false;
  }
} 