import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="space-y-3">
                    <p className="text-extrude-3d select-none text-8xl font-bold tracking-tight md:text-9xl">
                        404
                    </p>
                    <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
                    <p className="text-muted-foreground">
                        찾으시는 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                    </p>
                </div>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button asChild>
                        <Link href="/docs">문서 둘러보기</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/">홈으로 돌아가기</Link>
                    </Button>
                </div>

                <p className="border-t pt-6 text-sm text-muted-foreground">
                    URL을 다시 확인하거나 문서 목록에서 찾아보세요.
                </p>
            </div>
        </div>
    );
}
