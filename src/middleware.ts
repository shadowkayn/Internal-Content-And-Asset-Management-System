import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLogin = false; // 模拟未登录

  // 模拟未登录业务逻辑
  if (!isLogin && request.nextUrl.pathname.startsWith("/user")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 配置 matcher
export const config = {
  matcher: ["/user/:path*"],
};
