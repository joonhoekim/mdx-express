'use server';

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';
import { formatTitle } from './utils';
import { getErrorMessage } from './get-error-message';
import { CONTENT_DIR } from './mdx-types';
import type { MDXFile, MDXFrontmatter } from './mdx-types';

// 잘못된 타입의 필드는 경고 후 undefined로 정규화 → 잘못된 값이 그대로 흘러가지 않도록 함
const frontmatterSchema = z.object({
  title: z.string().optional().catch(undefined),
  subtitle: z.string().optional().catch(undefined),
  description: z.string().optional().catch(undefined),
  order: z.number().optional().catch(undefined),
  tags: z.array(z.string()).optional().catch(undefined),
}).passthrough();

function parseFrontmatter(data: unknown, filePath: string): MDXFrontmatter {
  const result = frontmatterSchema.safeParse(data ?? {});
  if (!result.success) {
    // data 자체가 객체가 아닌 경우 (string/array 등) → 빈 frontmatter로 처리
    console.warn(`[frontmatter] ${filePath}: ${result.error.message}`);
    return {};
  }
  return result.data as MDXFrontmatter;
}

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

// 경로 존재 여부 확인 헬퍼
export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
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

    const frontmatter = parseFrontmatter(data, filePath);

    // frontmatter title이 없으면 본문의 첫 번째 # 제목을 추출
    let title = frontmatter.title;
    if (!title) {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      title = headingMatch ? headingMatch[1].trim() : formatTitle(path.basename(filePath, '.mdx'));
    }

    return {
      slug: path.basename(filePath, '.mdx'),
      title,
      subtitle: frontmatter.subtitle,
      description: frontmatter.description,
      order: frontmatter.order || 0,
      tags: frontmatter.tags,
      path: filePath,
      content: await sanitizeMDXContent(content),
    };
  } catch (error) {
    console.error(`[getMDXFile] ${filePath}: ${getErrorMessage(error)}`);
    return null;
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
