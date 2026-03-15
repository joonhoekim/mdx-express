import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface SearchEntry {
  id: number;
  title: string;
  description: string;
  content: string;
  slug: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content');

async function collectMDXFiles(dir: string): Promise<SearchEntry[]> {
  const entries: SearchEntry[] = [];
  let id = 0;

  async function walk(currentDir: string, currentPath: string) {
    const dirents = await fs.readdir(currentDir, { withFileTypes: true });

    for (const dirent of dirents) {
      const fullPath = path.join(currentDir, dirent.name);

      if (dirent.isDirectory()) {
        await walk(fullPath, currentPath ? `${currentPath}/${dirent.name}` : dirent.name);
      } else if (dirent.name.endsWith('.mdx')) {
        try {
          const raw = await fs.readFile(fullPath, 'utf8');
          const { data, content } = matter(raw);

          let title = data.title;
          if (!title) {
            const headingMatch = content.match(/^#\s+(.+)$/m);
            title = headingMatch ? headingMatch[1] : path.basename(dirent.name, '.mdx');
          }

          const plainContent = content
            .replace(/^import\s.+$/gm, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/\{[^}]*\}/g, ' ')
            .replace(/[#*_~`>|]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 2000);

          // index.mdx → 디렉토리 경로, 그 외 → 파일명 경로
          const basename = path.basename(dirent.name, '.mdx');
          const slugPath = basename === 'index'
            ? currentPath
            : (currentPath ? `${currentPath}/${basename}` : basename);

          entries.push({
            id: id++,
            title,
            description: data.description || '',
            content: plainContent,
            slug: `/docs/${slugPath}`,
          });
        } catch {
          // 파싱 실패한 파일은 건너뜀
        }
      }
    }
  }

  await walk(dir, '');
  return entries;
}

export async function GET() {
  const entries = await collectMDXFiles(CONTENT_DIR);

  return NextResponse.json(entries, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
