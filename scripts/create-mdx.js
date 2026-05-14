#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function getExistingSections() {
  const contentDir = path.join(process.cwd(), 'content');
  if (!fs.existsSync(contentDir)) return [];
  return fs.readdirSync(contentDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

async function createMDXFile() {
  try {
    console.log('MDX 파일 생성 도구\n');

    const sections = getExistingSections();
    if (sections.length > 0) {
      console.log(`사용 가능한 섹션: ${sections.join(', ')}`);
    }

    const section = await question('섹션을 입력하세요: ');
    const slug = await question('파일명(slug)을 입력하세요 (예: getting-started): ');
    const title = await question('제목을 입력하세요: ');
    const subtitle = await question('부제를 입력하세요 (제목 아래 한 줄, 선택사항): ');
    const description = await question('설명을 입력하세요 (이 문서가 무엇을 다루는지 — SEO/인덱스용, 선택사항): ');
    const order = await question('순서를 입력하세요 (숫자, 기본값: 1): ') || '1';
    const tagsInput = await question('태그를 입력하세요 (쉼표 구분, 선택사항): ');

    if (!section || !slug || !title) {
      console.error('섹션, 파일명, 제목은 필수입니다.');
      process.exit(1);
    }

    const contentDir = path.join(process.cwd(), 'content');
    const sectionDir = path.join(contentDir, section);

    if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
    if (!fs.existsSync(sectionDir)) fs.mkdirSync(sectionDir, { recursive: true });

    const tags = tagsInput
      ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    // YAML 큰따옴표 문자열이 깨지지 않도록 " 와 \ 를 이스케이프
    const yamlString = s => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

    const frontmatterLines = [
      '---',
      `title: ${yamlString(title)}`,
      subtitle ? `subtitle: ${yamlString(subtitle)}` : null,
      description ? `description: ${yamlString(description)}` : null,
      `order: ${order}`,
      tags.length > 0 ? `tags: [${tags.map(yamlString).join(', ')}]` : null,
      '---',
      '',
    ].filter(line => line !== null).join('\n');

    // 본문에 # H1을 쓰지 않는다 — frontmatter title이 페이지 제목(h1)으로 렌더링됨
    const content = `${frontmatterLines}
${description || '여기에 내용을 작성하세요.'}

## 섹션 1

내용을 입력하세요.

## 섹션 2

내용을 입력하세요.

## 마무리

마무리 내용을 입력하세요.
`;

    const filePath = path.join(sectionDir, `${slug}.mdx`);

    if (fs.existsSync(filePath)) {
      console.error(`파일이 이미 존재합니다: ${filePath}`);
      process.exit(1);
    }

    fs.writeFileSync(filePath, content, 'utf8');

    console.log(`\nMDX 파일이 생성되었습니다!`);
    console.log(`파일 경로: ${filePath}`);
    console.log(`URL: http://localhost:3000/docs/${section}/${slug}`);
    console.log(`\n개발 서버를 실행하고 위 URL에서 확인하세요.`);

  } catch (error) {
    console.error('오류가 발생했습니다:', error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  createMDXFile();
}

module.exports = { createMDXFile };
