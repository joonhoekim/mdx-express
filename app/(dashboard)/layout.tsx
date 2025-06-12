import { TopNavigation } from "@/components/top-navigation";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="flex">
        <SidebarNavigation />
        <div className="flex-1">
          <BreadcrumbNavigation />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 