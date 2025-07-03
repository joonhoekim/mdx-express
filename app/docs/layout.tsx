import { TopNavigation } from "@/components/top-navigation";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";
import { getTopLevelItems, NavigationItem } from "@/lib/navigation";
import { getSiblingFiles } from "@/lib/mdx-utils";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const topLevelItems = await getTopLevelItems();
  // 사이드바 아이템은 sidebar-navigation.tsx에서 동적으로 생성
  const sidebarItems: NavigationItem[] = [];

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation topLevelItems={topLevelItems} />

      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-12 items-center px-6">
          <div className="flex items-center">
            <BreadcrumbNavigation />
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