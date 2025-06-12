import { TopNavigation } from "@/components/top-navigation";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-12 items-center px-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>문서</span>
          </div>
        </div>
      </div>
      <main className="container mx-auto py-6 max-w-4xl">
        {children}
      </main>
    </div>
  );
} 