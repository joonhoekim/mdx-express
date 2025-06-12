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

async function createMDXFile() {
  try {
    console.log('🚀 MDX 파일 생성 도구\n');
    
    const section = await question('섹션을 입력하세요 (dashboard/projects/settings): ');
    const slug = await question('파일명(slug)을 입력하세요 (예: getting-started): ');
    const title = await question('제목을 입력하세요: ');
    const description = await question('설명을 입력하세요 (선택사항): ');
    const order = await question('순서를 입력하세요 (숫자, 기본값: 1): ') || '1';
    
    // 유효성 검사
    if (!section || !slug || !title) {
      console.error('❌ 섹션, 파일명, 제목은 필수입니다.');
      process.exit(1);
    }
    
    const validSections = ['dashboard', 'projects', 'settings'];
    if (!validSections.includes(section)) {
      console.error('❌ 유효한 섹션을 입력하세요: dashboard, projects, settings');
      process.exit(1);
    }
    
    // 디렉토리 생성
    const contentDir = path.join(process.cwd(), 'content');
    const sectionDir = path.join(contentDir, section);
    
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    if (!fs.existsSync(sectionDir)) {
      fs.mkdirSync(sectionDir, { recursive: true });
    }
    
    // 파일 내용 생성
    const frontmatter = [
      '---',
      `title: "${title}"`,
      description ? `description: "${description}"` : null,
      `order: ${order}`,
      '---',
      ''
    ].filter(Boolean).join('\n');
    
    const content = `${frontmatter}
# ${title}

${description || '여기에 내용을 작성하세요.'}

## 섹션 1

내용을 입력하세요.

## 섹션 2

내용을 입력하세요.

## 마무리

마무리 내용을 입력하세요.
`;
    
    // 파일 저장
    const filePath = path.join(sectionDir, `${slug}.mdx`);
    
    if (fs.existsSync(filePath)) {
      console.error(`❌ 파일이 이미 존재합니다: ${filePath}`);
      process.exit(1);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n✅ MDX 파일이 생성되었습니다!`);
    console.log(`📁 파일 경로: ${filePath}`);
    console.log(`🌐 URL: http://localhost:3003/docs/${section}-${slug}`);
    console.log(`\n💡 개발 서버를 실행하고 위 URL에서 확인하세요.`);
    
  } catch (error) {
    console.error('❌ 오류가 발생했습니다:', error.message);
  } finally {
    rl.close();
  }
}

// 스크립트 실행
if (require.main === module) {
  createMDXFile();
}

module.exports = { createMDXFile }; 