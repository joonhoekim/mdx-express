import matter from 'gray-matter';

export const ALLOWED_KEYS = ['title', 'subtitle', 'description', 'order', 'tags'];

/** raw 첫 줄이 `---`이고 닫는 `---`이 있으면 그 닫는 줄 인덱스(0-based) 반환, 없으면 -1 */
function frontmatterEndLine(lines) {
  if (lines[0]?.trim() !== '---') return -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') return i;
  }
  return -1;
}

export function lintFile(raw, relPath) {
  const errors = [];
  const warnings = [];
  const lines = raw.split('\n');
  const fmEnd = frontmatterEndLine(lines);
  const hasFrontmatter = fmEnd !== -1;

  let data = {};
  try {
    data = matter(raw).data ?? {};
  } catch (e) {
    errors.push({ line: 1, rule: 'frontmatter-parse', msg: `frontmatter 파싱 실패: ${e.message}` });
  }

  // 규칙 4: frontmatter 부재
  if (!hasFrontmatter) {
    errors.push({ line: 1, rule: 'no-frontmatter', msg: 'frontmatter가 없음 (title 등 필요)' });
  }

  // 규칙 2: 화이트리스트 외 키
  for (const key of Object.keys(data)) {
    if (!ALLOWED_KEYS.includes(key)) {
      errors.push({ line: 1, rule: 'unknown-key', msg: `허용되지 않은 키: "${key}" (허용: ${ALLOWED_KEYS.join('/')})` });
    }
  }

  // 규칙 3: 타입
  if ('order' in data && typeof data.order !== 'number') {
    errors.push({ line: 1, rule: 'invalid-type', msg: `order는 number여야 함 (현재: ${typeof data.order})` });
  }
  if ('tags' in data && !(Array.isArray(data.tags) && data.tags.every(t => typeof t === 'string'))) {
    errors.push({ line: 1, rule: 'invalid-type', msg: 'tags는 string[]여야 함' });
  }

  // 본문 순회 (코드펜스 추적) — 규칙 1: 본문 H1
  const bodyStart = hasFrontmatter ? fmEnd + 1 : 0;
  let inFence = false;
  for (let i = bodyStart; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^(```|~~~)/.test(trimmed)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^#\s+/.test(lines[i])) {
      errors.push({ line: i + 1, rule: 'no-body-h1', msg: '본문 H1 사용 (title로 이전 필요)' });
    }
  }

  return { errors, warnings };
}
