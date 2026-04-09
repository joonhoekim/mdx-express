# mdx-express

Next.js 16 + MDX 기반 문서/블로그 사이트. 파일 시스템(`content/`)에서 MDX 파일을 읽어 React 컴포넌트로 렌더링한다.

## 기술 스택

- **프레임워크:** Next.js 16 (App Router, Turbopack)
- **언어:** TypeScript (strict mode)
- **스타일링:** Tailwind CSS 4 + Shadcn UI
- **MDX:** next-mdx-remote (RSC), remark/rehype 플러그인
- **테스트:** Vitest

## 시작하기

```bash
bun install
bun dev
```

[http://localhost:3000](http://localhost:3000)에서 확인.

## 명령어

```bash
bun dev            # 개발 서버 (Turbopack)
bun run build      # 프로덕션 빌드
bun start          # 프로덕션 서버
bun lint           # 린트
bun run test       # 전체 테스트 (1회 실행)
bun run test:watch # 테스트 watch 모드
bun create-mdx     # MDX 파일 생성
```

## 프로젝트 구조

```
app/docs/[...slug]/page.tsx   # MDX 동적 라우팅
components/mdx-renderer.tsx   # MDX → React 변환
lib/mdx-utils.ts              # MDX 파일 I/O, 트리 빌드
content/                      # MDX 콘텐츠
__tests__/                    # Vitest 테스트
```

## 콘텐츠 작성

`content/` 디렉토리에 `.mdx` 파일을 추가하면 자동으로 라우팅된다.

```
content/dev/react/hooks.mdx → /docs/dev/react/hooks
```

자세한 작성 규칙은 `CLAUDE.md`를 참고.
