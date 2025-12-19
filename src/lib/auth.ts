import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JWTPayload {
  userId: string;
  role: "admin" | "editor" | "viewer";
}

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (e) {
    return null;
  }
}

// 从请求上下文里 → 解析 token → 查数据库 → 返回用户
export async function getCurrentUser() {
  await connectDB();

  const cookieStore: any = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
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
