'use server';

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { NavigationItem } from './navigation';
import { naturalCompare, formatTitle } from './utils';
import { getErrorMessage } from './get-error-message';
import { buildDocsPath } from './build-docs-path';

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

    // frontmatter title이 없으면 본문의 첫 번째 # 제목을 추출
    let title = frontmatter.title;
    if (!title) {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      title = headingMatch ? headingMatch[1].trim() : formatTitle(path.basename(filePath, '.mdx'));
    }

    return {
      slug: path.basename(filePath, '.mdx'),
      title,
      description: frontmatter.description,
      order: frontmatter.order || 0,
      path: filePath,
      content: await sanitizeMDXContent(content), // MDX 파서 오류 방지를 위해 이스케이프 처리
    };
  } catch (error) {
    console.error(`[getMDXFile] ${filePath}: ${getErrorMessage(error)}`);
    return null;
  }
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
    console.error(`[buildMDXTree] ${currentPath.join('/')}: ${getErrorMessage(error)}`);
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
    console.error(`[getAllMDXNestedSections] ${getErrorMessage(error)}`);
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
    console.error(`[getMDXContentByPath] ${pathArray.join('/')}: ${getErrorMessage(error)}`);
    return null;
  }
}

// 경로 배열로 디렉토리인지 파일인지 판단
export async function getPathType(
  pathArray: string[]
): Promise<'file' | 'directory' | null> {
  try {
    const filePath = path.join(CONTENT_DIR, ...pathArray);

    if (await pathExists(`${filePath}.mdx`)) return 'file';
    if (await pathExists(filePath)) {
      const s = await fs.stat(filePath);
      if (s.isDirectory()) return 'directory';
    }

    return null;
  } catch (error) {
    console.error(`[getPathType] ${pathArray.join('/')}: ${getErrorMessage(error)}`);
    return null;
  }
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

// MDXFileNode 트리를 depth-first로 평탄화 (파일만, index 제외)
function flattenTree(nodes: MDXFileNode[]): MDXFileNode[] {
  const result: MDXFileNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file' && node.slug !== 'index') {
      result.push(node);
    } else if (node.type === 'directory' && node.children) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}

export async function getAdjacentArticles(slug: string[]): Promise<AdjacentArticles> {
  try {
    const section = slug[0];
    const tree = await buildMDXTree(section, [section]);
    const flat = flattenTree(tree);
    const currentKey = slug.join('/');
    const currentIndex = flat.findIndex(n => n.fullPath.join('/') === currentKey);

    if (currentIndex === -1) return { prev: null, next: null };

    const prev = currentIndex > 0
      ? { title: flat[currentIndex - 1].title, href: buildDocsPath(...flat[currentIndex - 1].fullPath) }
      : null;
    const next = currentIndex < flat.length - 1
      ? { title: flat[currentIndex + 1].title, href: buildDocsPath(...flat[currentIndex + 1].fullPath) }
      : null;

    return { prev, next };
  } catch (error) {
    console.error(`[getAdjacentArticles] ${getErrorMessage(error)}`);
    return { prev: null, next: null };
  }
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
    console.error(`[createMDXFile] ${section}/${slug}: ${getErrorMessage(error)}`);
    return false;
  }
}

// 현재 경로의 형제 파일들을 가져오는 함수 (중첩 경로 지원)
export async function getSiblingFiles(
  pathname: string
): Promise<NavigationItem[]> {
  try {
    // pathname에서 경로 추출: /docs/section/sub/.../file → ['section', 'sub', ..., 'file']
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length < 2 || pathSegments[0] !== 'docs') {
      return [];
    }

    // 'docs' 이후의 세그먼트에서 마지막(현재 파일/디렉토리)을 제외한 부모 경로
    const contentSegments = pathSegments.slice(1); // ['section', 'sub', ..., 'file']
    const parentSegments = contentSegments.slice(0, -1); // ['section', 'sub', ...]

    // 부모 디렉토리가 없으면 content 루트의 섹션이므로 빈 배열
    if (parentSegments.length === 0) {
      return [];
    }

    const parentDir = path.join(CONTENT_DIR, ...parentSegments);
    if (!(await pathExists(parentDir))) {
      return [];
    }

    // 부모 디렉토리의 tree를 빌드하여 형제 노드 가져오기
    const siblings = await buildMDXTree('', parentSegments);
    const basePath = parentSegments.join('/');

    return siblings
      .filter(node => node.slug !== 'index')
      .map(node => ({
        title: node.title,
        href: buildDocsPath(basePath, node.slug),
        type: node.type,
      }));
  } catch (error) {
    console.error(`[getSiblingFiles] ${getErrorMessage(error)}`);
    return [];
  }
}
