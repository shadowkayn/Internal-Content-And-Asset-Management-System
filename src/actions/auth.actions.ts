"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { comparePassword } from "@/lib/password";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function login(_: any, formData: FormData) {
  await connectDB();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const user = await User.findOne({ username });

  if (!user) {
    return { error: "用户不存在" };
  }

  if (user.status !== "active") {
    return { error: "用户被禁用" };
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return { error: "密码错误" };
  }

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: true, // 只在 HTTPS 连接中传输 cookie
    sameSite: "strict",
  });

  return { success: true };
}
