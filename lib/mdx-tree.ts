'use server';

import fs from 'fs/promises';
import path from 'path';
import { naturalCompare, formatTitle } from './utils';
import { getErrorMessage } from './get-error-message';
import { CONTENT_DIR } from './mdx-types';
import type { MDXFileNode, MDXNestedSection } from './mdx-types';
import { getMDXFile, ensureContentDirectory, pathExists } from './mdx-file';

// 정렬 헬퍼: order 필드에 따라 정렬, 같으면 자연스러운 숫자 정렬 적용
function sortByOrderAndName<T extends { order?: number; slug: string }>(items: T[]): T[] {
  return items.sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return naturalCompare(a.slug, b.slug);
  });
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

      nodes.push({
        type: 'directory',
        name: dirName,
        slug: dirName,
        title: formatTitle(dirName),
        order: 0,
        path: dirPath.join('/'),
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
