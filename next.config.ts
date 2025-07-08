import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // next-mdx-remote를 사용하므로 기본 Next.js 설정만 유지
  experimental: {
    mdxRs: false, // MDX RS 비활성화
  },
};

export default nextConfig;
