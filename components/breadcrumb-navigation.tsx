"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  title: string;
  href?: string;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "홈", href: "/" }
  ];

  // 파일명을 기반으로 제목 생성 함수
  const formatTitle = (segment: string): string => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const title = formatTitle(segment);

    if (index === segments.length - 1) {
      // 마지막 항목은 링크 없이
      breadcrumbs.push({ title });
    } else {
      breadcrumbs.push({ title, href: currentPath });
    }
  });

  return breadcrumbs;
}

export function BreadcrumbNavigation() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  // 홈 페이지에서는 브레드크럼을 표시하지 않음
  // docs 경로에서는 더 자주 브레드크럼 표시
  if (pathname === "/") {
    return null;
  }

  // docs 경로가 아닌 경우에만 길이 제한 적용
  if (!pathname.startsWith("/docs") && breadcrumbs.length <= 2) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href || crumb.title} className="flex items-center">
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href} className="flex items-center gap-1">
                    {index === 0 && <Home className="h-4 w-4" />}
                    {crumb.title}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1">
                  {index === 0 && <Home className="h-4 w-4" />}
                  {crumb.title}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 