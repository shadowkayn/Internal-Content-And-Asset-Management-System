// 在 Next.js 中，当从一个文件 import 任何东西时，Next.js 会尝试编译该文件的所有内容。
// 中间件 (Middleware) 运行在 Edge Runtime（极简环境）。
// Mongoose/User 模型 依赖 Node.js 的原生 net、tls 和 crypto 模块。
// 即使你在中间件里只用了 verifyToken，但因为同一个文件里有 User 模型，Edge 环境会尝试加载它，结果发现不支持，直接崩溃报错。
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value as string;
  const pathName = request.nextUrl.pathname;

  // 公开路由放行
  if (pathName.startsWith("/auth/login")) {
    return NextResponse.next();
  }

  const backLogin = () =>
    NextResponse.redirect(new URL("/auth/login", request.url));

  // 未登录
  if (!token) {
    // 必须return重定向响应
    return backLogin();
  }

  const payload: any = await verifyToken(token);
  if (!payload) {
    // 必须return重定向响应
    return backLogin();
  }

  // 动态路径拦截
  const allowedPaths = payload.allowedPaths || [];
  // 校验逻辑：当前访问的路径，是否在允许列表中
  // 使用 .some + .startsWith 兼容动态路由 (如 /preview/123)
  const isAllowed = allowedPaths.some((path: string) =>
    pathName.startsWith(path),
  );

  // 如果不匹配，重定向到 403 或 dashboard
  if (!isAllowed) {
    console.warn(`权限不足，拒绝访问: ${pathName}`);
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

// 配置 matcher
export const config = {
  // 匹配所有 /admin 下子路径
  matcher: ["/admin/:path*"],
};
