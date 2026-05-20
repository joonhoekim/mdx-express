export const ALLOWED_KEYS: readonly ['title', 'subtitle', 'description', 'order', 'tags'];

export interface Diagnostic {
  line: number;
  rule: string;
  msg: string;
}

export function lintFile(
  raw: string,
  relPath: string,
): { errors: Diagnostic[]; warnings: Diagnostic[] };

export function fixFile(
  raw: string,
  relPath: string,
): { content: string; changed: boolean; applied: string[] };
