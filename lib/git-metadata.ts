import { spawnSync } from 'child_process';

export interface GitMetadata {
  created: string; // YYYY-MM-DD, 최초 커밋 일자
  updated: string; // YYYY-MM-DD, 마지막 커밋 일자
  author: string;  // 최초 커밋 작성자
}

const cache = new Map<string, GitMetadata>();

export function getGitMetadata(absoluteFilePath: string): GitMetadata {
  if (cache.has(absoluteFilePath)) return cache.get(absoluteFilePath)!;

  const fallback: GitMetadata = { created: '', updated: '', author: '' };

  const result = spawnSync(
    'git',
    ['log', '--follow', '--pretty=format:%an%x09%ad', '--date=short', '--', absoluteFilePath],
    { encoding: 'utf-8' }
  );

  if (result.error || result.status !== 0) {
    cache.set(absoluteFilePath, fallback);
    return fallback;
  }

  const lines = result.stdout.trim().split('\n').filter(Boolean);
  if (lines.length === 0) {
    cache.set(absoluteFilePath, fallback);
    return fallback;
  }

  // git log은 최신 커밋부터 출력 → lines[0] = 최신, lines[last] = 최초
  const [updatedAuthor, updatedDate] = lines[0].split('\t');
  const [firstAuthor, firstDate] = lines[lines.length - 1].split('\t');

  const metadata: GitMetadata = {
    created: firstDate ?? '',
    updated: updatedDate ?? '',
    author: firstAuthor ?? updatedAuthor ?? '',
  };

  cache.set(absoluteFilePath, metadata);
  return metadata;
}
