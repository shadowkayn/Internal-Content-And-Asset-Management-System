"use server";

import { connectDB } from "@/lib/db";
import UserModel from "@/models/user.model";

export async function createUser(prevState: any, formData: FormData) {
  try {
    await connectDB();
    const username = formData.get("username");
    const password = formData.get("password");
    const email = formData.get("email");
    const phone = formData.get("phone");

    if (!username) {
      return { error: "username 字段不能为空" };
    }

    if (!password) {
      return { error: "password 字段不能为空" };
    }

    if (!email) {
      return { error: "email 字段不能为空" };
    }

    if (!phone) {
      return { error: "phone 字段不能为空" };
    }

    await UserModel.create({
      username,
      password,
      email,
      phone,
    });

    return { success: true };
  } catch (e: any) {
    return { error: e.message || "服务器错误" };
  }
}
