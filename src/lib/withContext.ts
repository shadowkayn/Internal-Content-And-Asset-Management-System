import { cookies } from "next/headers";
import { verifyToken } from "@/lib/token";
import { userStorage } from "@/lib/context";

// 由于 Next.js 的 Server Actions 或 API Route 是入口，需要一个函数来解析 Token 并开启上下文
// 接收一个Server Action,把 userId放到上下文作用域中
export function withAuthContext(handler: any) {
  return async (...args: any[]) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let userId = "";
    let role = "";
    if (token) {
      try {
        const payload: any = await verifyToken(token);
        userId = payload?.userId;
        role = payload?.role;
      } catch (e) {
        console.error("Token校验失败");
      }
    }

    // 开启异步上下文作用域
    return userStorage.run({ userId, role }, () => handler(...args));
  };
}
