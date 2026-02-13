'use server';

import fs from 'fs/promises';
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

export interface MDXSubDirectory {
  name: string;
  slug: string;
  title: string;
  order?: number;
}

export interface MDXSection {
  section: string;
  files: MDXFile[];
  directories: MDXSubDirectory[];
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
  author?: string;
  date?: string;
  tags?: string[];
  [key: string]: unknown;
}

// 컨텐츠 디렉토리 경로
const CONTENT_DIR = path.join(process.cwd(), 'content');

// MDX 파서 오류를 방지하기 위해 코드 블록 내부의 특수문자들을 이스케이프하는 함수
export async function sanitizeMDXContent(content: string): Promise<string> {
  // CodeBlock 컴포넌트 내부의 텍스트를 JSX 파서가 해석하지 않도록 HTML 엔티티로 이스케이프
  // - JSX 컨텐츠에서 `<`, `>`, `{`, `}` 는 문법으로 해석되기 때문에 반드시 치환 필요
  // - 템플릿 리터럴로 감싸는 방식은 JS 이스케이프 해석 문제(예: \x, \[)를 유발하므로 사용하지 않음
  return content.replace(
    /<CodeBlock[^>]*>([\s\S]*?)<\/CodeBlock>/g,
    (match, codeContent) => {
      const htmlEscaped = codeContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\{/g, '&#123;')
        .replace(/\}/g, '&#125;');

      return match.replace(codeContent, htmlEscaped);
    }
  );
}

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

    if (!(await pathExists(fullPath))) {
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
      content: await sanitizeMDXContent(content), // MDX 파서 오류 방지를 위해 이스케이프 처리
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[getMDXFile] ${filePath}: ${message}`);
    return null;
  }
}

// 자연스러운 숫자 정렬을 위한 비교 함수
function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// 정렬 헬퍼: order 필드에 따라 정렬, 같으면 자연스러운 숫자 정렬 적용
function sortByOrderAndName<T extends { order?: number; slug: string }>(items: T[]): T[] {
  return items.sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return naturalCompare(a.slug, b.slug);
  });
}

// 경로 존재 여부 확인 헬퍼
async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

// 특정 섹션의 모든 MDX 파일 가져오기 - 서버 액션
export async function getMDXFiles(sectionPath: string): Promise<MDXFile[]> {
  try {
    const fullPath = path.join(CONTENT_DIR, sectionPath);

    if (!(await pathExists(fullPath))) {
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

    return sortByOrderAndName(mdxFiles);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[getMDXFiles] ${sectionPath}: ${message}`);
    return [];
  }
}

// 특정 섹션의 하위 디렉토리들 가져오기
async function getSubDirectories(sectionPath: string): Promise<MDXSubDirectory[]> {
  try {
    const fullPath = path.join(CONTENT_DIR, sectionPath);

    const dirents = await fs.readdir(fullPath, { withFileTypes: true });
    const directories = dirents.filter((dirent) => dirent.isDirectory());

    const result: MDXSubDirectory[] = [];

    for (const dir of directories) {
      const dirName = dir.name;
      const indexPath = path.join(sectionPath, dirName, 'index.mdx');
      const indexFile = await getMDXFile(indexPath);

      result.push({
        name: dirName,
        slug: dirName,
        title: indexFile?.title || formatTitle(dirName),
        order: indexFile?.order,
      });
    }

    return sortByOrderAndName(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[getSubDirectories] ${sectionPath}: ${message}`);
    return [];
  }
}

// 모든 섹션의 MDX 파일들 가져오기 - 서버 액션
export async function getAllMDXSections(): Promise<MDXSection[]> {
  try {
    await ensureContentDirectory();

    if (!(await pathExists(CONTENT_DIR))) {
      return [];
    }

    const dirents = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    const sections = dirents
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .sort(naturalCompare);

    const result: MDXSection[] = [];
    for (const section of sections) {
      const files = await getMDXFiles(section);
      const directories = await getSubDirectories(section);
      result.push({ section, files, directories });
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[getAllMDXSections] ${message}`);
    return [];
  }
}

// 재귀적으로 디렉토리를 탐색하여 MDXFileNode 트리 구축
export async function buildMDXTree(
  basePath: string,
  currentPath: string[] = []
): Promise<MDXFileNode[]> {
  try {
    const fullPath = path.join(CONTENT_DIR, ...currentPath);

    if (!(await pathExists(fullPath))) {
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
        title: indexFile?.title || formatTitle(dirName),
        description: indexFile?.description,
        order: indexFile?.order || 0,
        path: dirPath.join('/'),
        content: indexFile?.content,
        children,
        fullPath: dirPath,
      });
    }

    return sortByOrderAndName(nodes);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[buildMDXTree] ${currentPath.join('/')}: ${message}`);
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
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[getAllMDXNestedSections] ${message}`);
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
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[getMDXContentByPath] ${pathArray.join('/')}: ${message}`);
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
    if (await pathExists(mdxFilePath)) {
      return 'file';
    }

    // 디렉토리인지 확인
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        return 'directory';
      }
    } catch {
      // 둘 다 아니면 null 반환
    }

    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[getPathType] ${pathArray.join('/')}: ${message}`);
    return null;
  }
}

// 이름을 제목으로 포맷팅 (디렉토리, 섹션 모두 사용)
function formatTitle(name: string): string {
  return name
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

    if (!(await pathExists(sectionDir))) {
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
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[createMDXFile] ${section}/${slug}: ${message}`);
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

    if (!(await pathExists(sectionDir))) {
      return [];
    }

    const dirents = await fs.readdir(sectionDir, { withFileTypes: true });

    // MDX 파일 처리
    const mdxFiles: MDXFile[] = [];
    for (const dirent of dirents) {
      if (dirent.isFile() && dirent.name.endsWith('.mdx')) {
        const filePath = path.join(section, dirent.name);
        const mdxFile = await getMDXFile(filePath);
        if (mdxFile) {
          mdxFiles.push(mdxFile);
        }
      }
    }

    // 하위 디렉토리 처리
    const subDirs: MDXSubDirectory[] = [];
    for (const dirent of dirents) {
      if (dirent.isDirectory()) {
        const indexPath = path.join(section, dirent.name, 'index.mdx');
        const indexFile = await getMDXFile(indexPath);
        subDirs.push({
          name: dirent.name,
          slug: dirent.name,
          title: indexFile?.title || formatTitle(dirent.name),
          order: indexFile?.order,
        });
      }
    }

    // 정렬
    const sortedFiles = sortByOrderAndName(mdxFiles);
    const sortedDirs = sortByOrderAndName(subDirs);

    // NavigationItem으로 변환 후 합치기
    const fileItems: NavigationItem[] = sortedFiles.map((mdxFile) => ({
      title: mdxFile.title,
      href: `/docs/${section}/${mdxFile.slug}`,
    }));

    const dirItems: NavigationItem[] = sortedDirs.map((dir) => ({
      title: dir.title,
      href: `/docs/${section}/${dir.slug}`,
    }));

    return [...fileItems, ...dirItems];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[getSiblingFiles] ${message}`);
    return [];
  }
}

// 현재 경로에서 섹션 제목을 포맷팅하는 함수
export async function formatSectionTitle(section: string): Promise<string> {
  return formatTitle(section);
}
