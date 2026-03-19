interface MDXError extends Error {
  line?: number;
  column?: number;
  position?: { start?: { line?: number; column?: number } };
}

/** MDX 컴파일 에러를 소스 코드 컨텍스트와 함께 포맷 */
export function formatMDXError(error: unknown, source: string): string {
  const err = error as MDXError;
  const name = err.name || 'Error';
  const message = err.message || String(error);

  const line = err.line || err.position?.start?.line;
  const column = err.column || err.position?.start?.column;

  const parts: string[] = [`[MDX ${name}] ${message}`];

  if (line) {
    parts.push(`  → 위치: ${line}줄${column ? `, ${column}열` : ''}`);

    const lines = source.split('\n');
    const start = Math.max(0, line - 3);
    const end = Math.min(lines.length, line + 2);

    parts.push('  ─── 소스 ───');
    for (let i = start; i < end; i++) {
      const marker = i === line - 1 ? '▶' : ' ';
      parts.push(`  ${marker} ${String(i + 1).padStart(4)} │ ${lines[i]}`);
    }
    parts.push('  ────────────');
  }

  return parts.join('\n');
}

/** 개발 모드에서 렌더링 에러를 표시하는 컴포넌트 */
export function MDXErrorDisplay({ message }: { message: string }) {
  return (
    <div className="p-6 my-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
      <h2 className="text-red-700 dark:text-red-400 font-bold text-lg mb-2">MDX 렌더링 오류</h2>
      <pre className="text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap overflow-x-auto">{message}</pre>
    </div>
  );
}
