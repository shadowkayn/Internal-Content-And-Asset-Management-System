import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 解决 svg-captcha 找不到字体的问题
  serverExternalPackages: ["svg-captcha"],
};

export default nextConfig;
