'use server';

import path from 'path';
import { NavigationItem } from './navigation';
import { getErrorMessage } from './get-error-message';
import { buildDocsPath } from './build-docs-path';
import { CONTENT_DIR } from './mdx-types';
import type { MDXFileNode, AdjacentArticles } from './mdx-types';
import { pathExists } from './mdx-file';
import { buildMDXTree } from './mdx-tree';

// MDXFileNode 트리를 depth-first로 평탄화 (파일만)
function flattenTree(nodes: MDXFileNode[]): MDXFileNode[] {
  const result: MDXFileNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
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
