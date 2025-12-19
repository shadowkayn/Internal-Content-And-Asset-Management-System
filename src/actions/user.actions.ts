"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { hashPassword } from "@/lib/password";

// add
export async function createUser(_: any, formData: FormData) {
  await connectDB();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!username || !password) {
    return { error: "用户名或密码不能为空" };
  }

  const exists = await User.findOne({ username });
  if (exists) {
    return { error: "用户已存在" };
  }

  await User.create({
    username,
    password: await hashPassword(password),
    role,
  });

  return { success: true };
}

// list
export async function listUsers(page: number = 1, pageSize: number = 10) {
  await connectDB();

  const skip = (page - 1) * pageSize;

  const [list, total] = await Promise.all([
    User.find().skip(skip).limit(pageSize).select("-password"),
    User.countDocuments(),
  ]);

  return { list, total };
}

// update
export async function updateUser(
  userId: string,
  data: {
    status?: "active" | "disabled";
    role?: "admin" | "editor" | "viewer";
  },
) {
  await connectDB();

  await User.findByIdAndUpdate(userId, data);

  return { success: true };
}
