import { NextRequest, NextResponse } from 'next/server';
import { getSiblingFiles } from '@/lib/mdx-utils';

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

    const siblingFiles = await getSiblingFiles(pathname);
    return NextResponse.json({ files: siblingFiles });
  } catch (error) {
    console.error('Error fetching sibling files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sibling files' },
      { status: 500 }
    );
  }
}
