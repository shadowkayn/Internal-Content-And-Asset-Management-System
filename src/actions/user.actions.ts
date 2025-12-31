"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { hashPassword } from "@/lib/password";
import { UserListService } from "@/service/userList.service";

// add
export async function addUserAction(_: any, formData: FormData) {
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
export async function getUserListAction(params: any) {
  try {
    const result = await UserListService.getUserList(params);
    return { success: true, result };
  } catch (e) {
    return { error: "查询失败" };
  }
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
