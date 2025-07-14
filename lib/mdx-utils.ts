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

export interface MDXSection {
  section: string;
  files: MDXFile[];
}

// 새로운 섹션 인터페이스 - 중첩 구조 지원
export interface MDXNestedSection {
  section: string;
  tree: MDXFileNode[];
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
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

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

  return files.map((file) => ({
    title: file.title,
    href: `${baseHref}/${sectionPath}-${file.slug}`,
  }));
}

// 섹션별로 네비게이션 아이템 생성 - 서버 액션
export async function generateMDXNavigation(
  pathname: string
): Promise<NavigationItem[]> {
  // 현재 경로에서 섹션 추출
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return [];

  // 현재 섹션 결정 (예: /dashboard -> dashboard)
  const currentSection = pathSegments[0];

  // 해당 섹션의 MDX 파일들 가져오기
  const mdxItems = await mdxFilesToNavigationItems(currentSection, '/docs');

  return mdxItems;
}

// 특정 MDX 파일의 내용 가져오기 (동적 라우팅용) - 서버 액션
export async function getMDXContent(
  section: string,
  slug: string
): Promise<MDXFile | null> {
  const filePath = path.join(section, `${slug}.mdx`);
  return await getMDXFile(filePath);
}

// 재귀적으로 디렉토리를 탐색하여 MDXFileNode 트리 구축
export async function buildMDXTree(
  basePath: string,
  currentPath: string[] = []
): Promise<MDXFileNode[]> {
  try {
    const fullPath = path.join(CONTENT_DIR, ...currentPath);

    // 디렉토리 존재 여부 확인
    try {
      await fs.access(fullPath);
    } catch {
      return [];
    }

    const dirents = await fs.readdir(fullPath, { withFileTypes: true });
    const nodes: MDXFileNode[] = [];

    // 파일과 디렉토리를 분리하여 처리
    const files = dirents.filter(
      (dirent) => dirent.isFile() && dirent.name.endsWith('.mdx')
    );
    const directories = dirents.filter((dirent) => dirent.isDirectory());

    // MDX 파일들 처리
    for (const file of files) {
      const fileName = file.name;
      const slug = path.basename(fileName, '.mdx');
      const filePath = [...currentPath, fileName].join('/');

      const mdxFile = await getMDXFile(filePath);
      if (mdxFile) {
        nodes.push({
          type: 'file',
          name: fileName,
          slug,
          title: mdxFile.title,
          description: mdxFile.description,
          order: mdxFile.order || 0,
          path: filePath,
          content: mdxFile.content,
          fullPath: [...currentPath, slug],
        });
      }
    }

    // 하위 디렉토리들 재귀적으로 처리
    for (const directory of directories) {
      const dirName = directory.name;
      const dirPath = [...currentPath, dirName];

      const children = await buildMDXTree(basePath, dirPath);

      // 디렉토리에 index.mdx가 있는지 확인
      const indexFile = await getMDXFile([...dirPath, 'index.mdx'].join('/'));

      nodes.push({
        type: 'directory',
        name: dirName,
        slug: dirName,
        title: indexFile?.title || formatDirectoryTitle(dirName),
        description: indexFile?.description,
        order: indexFile?.order || 0,
        path: dirPath.join('/'),
        content: indexFile?.content,
        children,
        fullPath: dirPath,
      });
    }

    // order 필드에 따라 정렬
    return nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error(
      `Error building MDX tree for ${currentPath.join('/')}:`,
      error
    );
    return [];
  }
}

// 모든 섹션의 중첩 구조 가져오기
export async function getAllMDXNestedSections(): Promise<MDXNestedSection[]> {
  try {
    await ensureContentDirectory();

    const dirents = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    const sections = dirents
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const result: MDXNestedSection[] = [];
    for (const section of sections) {
      const tree = await buildMDXTree(section, [section]);
      result.push({ section, tree });
    }

    return result;
  } catch (error) {
    console.error('Error reading nested MDX sections:', error);
    return [];
  }
}

// 경로 배열로 특정 MDX 파일 찾기
export async function getMDXContentByPath(
  pathArray: string[]
): Promise<MDXFile | null> {
  try {
    // 마지막 요소가 파일명인지 확인
    const filePath = pathArray.join('/');

    // .mdx 확장자가 없으면 추가
    const mdxFilePath = filePath.endsWith('.mdx')
      ? filePath
      : `${filePath}.mdx`;

    return await getMDXFile(mdxFilePath);
  } catch (error) {
    console.error(
      `Error getting MDX content for path ${pathArray.join('/')}:`,
      error
    );
    return null;
  }
}

// 경로 배열로 디렉토리인지 파일인지 판단
export async function getPathType(
  pathArray: string[]
): Promise<'file' | 'directory' | null> {
  try {
    const filePath = path.join(CONTENT_DIR, ...pathArray);

    // 파일로 시도
    const mdxFilePath = `${filePath}.mdx`;
    try {
      await fs.access(mdxFilePath);
      return 'file';
    } catch {
      // 파일이 아니면 디렉토리인지 확인
      try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          return 'directory';
        }
      } catch {
        // 둘 다 아니면 null 반환
      }
    }

    return null;
  } catch (error) {
    console.error(
      `Error determining path type for ${pathArray.join('/')}:`,
      error
    );
    return null;
  }
}

// 디렉토리명을 제목으로 포맷팅
function formatDirectoryTitle(dirName: string): string {
  return dirName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

// 현재 경로의 형제 파일들을 가져오는 함수
export async function getSiblingFiles(
  pathname: string
): Promise<NavigationItem[]> {
  try {
    // pathname에서 섹션과 현재 파일 추출
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length < 2 || pathSegments[0] !== 'docs') {
      return [];
    }

    const section = pathSegments[1]; // 예: 'dashboard', 'guides', 'projects'
    const sectionDir = path.join(CONTENT_DIR, section);

    // 섹션 디렉토리 존재 여부 확인
    try {
      await fs.access(sectionDir);
    } catch {
      return [];
    }

    const files = await fs.readdir(sectionDir);
    const mdxFiles: MDXFile[] = [];

    for (const file of files) {
      if (file.endsWith('.mdx')) {
        const filePath = path.join(section, file);
        const mdxFile = await getMDXFile(filePath);
        if (mdxFile) {
          mdxFiles.push(mdxFile);
        }
      }
    }

    // order 필드에 따라 정렬 후 NavigationItem으로 변환
    return mdxFiles
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((mdxFile) => ({
        title: mdxFile.title,
        href: `/docs/${section}/${mdxFile.slug}`,
      }));
  } catch (error) {
    console.error('Error getting sibling files:', error);
    return [];
  }
}

// 현재 경로에서 섹션 제목을 포맷팅하는 함수
export async function formatSectionTitle(section: string): Promise<string> {
  return section
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
