// Barrel re-export — keeps all existing imports from '@/lib/mdx-utils' working.

export type {
  MDXFile,
  MDXFileNode,
  MDXNestedSection,
  MDXFrontmatter,
  AdjacentArticle,
  AdjacentArticles,
} from './mdx-types';

export { CONTENT_DIR } from './mdx-types';

export {
  sanitizeMDXContent,
  ensureContentDirectory,
  pathExists,
  getMDXFile,
  createMDXFile,
  getMDXContentByPath,
  getPathType,
} from './mdx-file';

export {
  buildMDXTree,
  getAllMDXNestedSections,
} from './mdx-tree';

export {
  getAdjacentArticles,
  getSiblingFiles,
} from './mdx-navigation';
