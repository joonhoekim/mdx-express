import { BookOpen } from 'lucide-react';
import { getRecentArticles } from '@/lib/recent-articles';
import { RecentArticlesList } from '@/components/recent-articles-list';

export default async function DocsIndexPage() {
  const articles = await getRecentArticles();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">최신 글</h1>
        <p className="text-muted-foreground">
          최근에 쓰거나 고친 글부터 모아봤어요. 카테고리 탐색은 왼쪽 사이드바를 이용하세요.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">글이 없습니다</h3>
          <p className="text-muted-foreground">
            content 폴더에 MDX 파일을 추가하면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <RecentArticlesList articles={articles} />
      )}
    </div>
  );
}
