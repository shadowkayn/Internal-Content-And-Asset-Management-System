"use server";

import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { verifyToken } from "@/lib/token";

export interface JWTPayload {
  userId: string;
  role: "admin" | "editor" | "viewer";
}

// 从请求上下文里 → 解析 token → 查数据库 → 返回用户
export async function getCurrentUser() {
  await connectDB();

  const cookieStore: any = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload: JWTPayload | any = await verifyToken(token);
    // .select("-password") 的作用是从数据库查询结果中排除 password 字段
    const user = await User.findById(payload?.userId).select("-password");

    if (!user) {
      return null;
    }

    return user;
  } catch (e) {
    return null;
  }
}
