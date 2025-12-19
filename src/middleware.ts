import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { JWTPayload, verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value as string;
  const pathName = request.nextUrl.pathname;

  // 公开路由
  if (pathName.startsWith("/login") || pathName.startsWith("/register")) {
    return NextResponse.next();
  }

  const backLogin = () => NextResponse.redirect(new URL("/login", request.url));

  // 未登录
  if (!token) {
    // 必须return重定向响应
    return backLogin();
  }

  const payload = verifyToken(token) as JWTPayload;
  if (!payload) {
    // 必须return重定向响应
    return backLogin();
  }

  // 角色权限控制（基础版）
  if (pathName.startsWith("/system") && payload?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 配置 matcher
export const config = {
  // 匹配 /dashboard 、/system 、 /content 下的所有子路径
  matcher: ["/dashboard/:path*", "/system/:path*", "/content/:path*"],
};
