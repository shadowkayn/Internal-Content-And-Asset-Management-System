import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 解决 svg-captcha 找不到字体的问题
  // 将 geoip-lite 排除在打包之外
  serverExternalPackages: ["svg-captcha", "geoip-lite"],
  experimental: {
    serverActions: {
      // 允许局域网 IP 访问开发服务器资源
      allowedOrigins: ["192.168.40.87:3000", "localhost:3000"],
    },
  },
};

export default nextConfig;
