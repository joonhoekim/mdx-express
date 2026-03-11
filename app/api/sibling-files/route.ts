import { NextRequest, NextResponse } from 'next/server';
import { getSiblingFiles } from '@/lib/mdx-utils';
import { getErrorMessage } from '@/lib/get-error-message';

// pathname 검증 패턴: /docs/ 로 시작하고 영문 소문자, 숫자, 슬래시, 하이픈만 허용
const VALID_PATHNAME_PATTERN = /^\/docs\/[a-z0-9\/\-]+$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathname = searchParams.get('pathname');

    if (!pathname) {
      return NextResponse.json(
        { error: 'Pathname is required' },
        { status: 400 }
      );
    }

    if (!VALID_PATHNAME_PATTERN.test(pathname)) {
      return NextResponse.json(
        { error: 'Invalid pathname format' },
        { status: 400 }
      );
    }

    const siblingFiles = await getSiblingFiles(pathname);
    return NextResponse.json(
      { files: siblingFiles },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error(`[sibling-files API] ${getErrorMessage(error)}`);
    return NextResponse.json(
      { error: 'Failed to fetch sibling files' },
      { status: 500 }
    );
  }
}
