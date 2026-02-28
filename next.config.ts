import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许 Notion 图片域名
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.notion.so",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
