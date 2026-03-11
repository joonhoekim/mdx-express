export function buildDocsPath(...segments: string[]): string {
  return `/docs/${segments.join('/')}`;
}
