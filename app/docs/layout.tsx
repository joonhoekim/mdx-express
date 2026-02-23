import { TopNavigationServer } from "@/components/top-navigation-server";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { ResizableSidebarLayout } from "@/components/resizable-sidebar-layout";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";
import { getTopLevelItems, getSidebarItems } from "@/lib/navigation";
import { headers } from 'next/headers';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const topLevelItems = await getTopLevelItems();

  // 현재 경로를 가져와서 동적으로 사이드바 아이템 생성
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/docs';
  const sidebarItems = await getSidebarItems(pathname);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopNavigationServer topLevelItems={topLevelItems} />

      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex min-h-8 items-center px-4 md:px-6">
          <BreadcrumbNavigation />
        </div>
      </div>

      <ResizableSidebarLayout
        sidebar={<SidebarNavigation sidebarItems={sidebarItems} />}
      >
        {children}
      </ResizableSidebarLayout>
    </div>
  );
} 