import { TopNavigation } from "@/components/top-navigation";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { getTopLevelItems, getSidebarItems } from "@/lib/navigation";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const topLevelItems = await getTopLevelItems();
  // docs 레이아웃이므로 '/docs' 경로로 사이드바 아이템 가져오기
  const sidebarItems = await getSidebarItems('/docs');

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation topLevelItems={topLevelItems} />

      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-12 items-center px-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>문서</span>
          </div>
          <div className="ml-auto">
            <MobileSidebar sidebarItems={sidebarItems} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 데스크톱 사이드바 */}
        <aside className="hidden md:flex w-64 shrink-0">
          <SidebarNavigation sidebarItems={sidebarItems} />
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto py-6 px-6 max-w-4xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 