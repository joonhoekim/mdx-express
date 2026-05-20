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

  // 첫 본문 비어있지 않은 줄 (코드펜스 밖) 찾기 — subtitle 후보 판정용
  let firstBodyLine = -1;
  inFence = false;
  for (let i = bodyStart; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^(```|~~~)/.test(trimmed)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (trimmed !== '') { firstBodyLine = i; break; }
  }

  // 규칙 5: description 없음
  if (!data.description) {
    warnings.push({ line: 1, rule: 'no-description', msg: 'description 없음 (섹션 카드·meta 비게 됨)' });
  }
  // 규칙 7: order 없음
  if (!('order' in data)) {
    warnings.push({ line: 1, rule: 'no-order', msg: 'order 없음 (파일명 정렬에 의존)' });
  }
  // 규칙 6: subtitle 후보
  if (!data.subtitle && firstBodyLine !== -1) {
    const t = lines[firstBodyLine].trim();
    if (/^\*".*"\*$/.test(t) || /^\*[^*]+\*$/.test(t)) {
      warnings.push({ line: firstBodyLine + 1, rule: 'subtitle-candidate', msg: '본문 첫 줄이 이탤릭 인용 — subtitle로 이전 가능' });
    }
  }

  return { errors, warnings };
}
