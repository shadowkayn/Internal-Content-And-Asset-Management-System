"use server";

import { UserListService } from "@/service/userList.service";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { z } from "zod";

const addSchema = z
  .object({
    username: z.string("用户名不能为空").min(1, "用户名不能为空"),
    password: z.string("密码不能为空").min(6, "密码长度不能小于6位"),
    nickname: z.string("昵称不能为空").min(1, "昵称不能为空"),
    email: z.string("邮箱不能为空").email("邮箱格式不正确"),
    status: z.enum(
      ["active", "disabled"],
      "状态参数无效，请输入active或disabled",
    ),
    role: z.string("角色不能为空").min(1, "角色不能为空"),
    phone: z.string("手机号不能为空").min(1, "手机号不能为空"),
  })
  .passthrough();

const editSchema = addSchema
  .extend({
    id: z.string("用户ID不能为空").min(1, "用户ID不能为空"),
  })
  .passthrough();

// add
export async function addUserAction(data: any) {
  const validatedData = addSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: validatedData.error.issues[0].message };
  }

  try {
    await UserListService.createUser(validatedData.data);
    revalidatePath("/admin/users/list");

    return { success: true };
  } catch (e: any) {
    return { error: e.message || "新增失败" };
  }
}

// list
export async function getUserListAction(params: any) {
  try {
    const result = await UserListService.getUserList(params);

    return { success: true, result };
  } catch (e: any) {
    return { error: e.message || "查询失败" };
  }
}

// update
export async function updateUserAction(data: any) {
  const validatedData = editSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: validatedData.error.issues[0].message };
  }

  try {
    await UserListService.updateUser(validatedData.data);
    revalidatePath("/admin/users/list");

    return { success: true };
  } catch (e: any) {
    return { error: e.message || "更新失败" };
  }
}

// remove
export async function removeUserAction(ids: string[]) {
  try {
    await UserListService.deleteUser(ids);
    revalidatePath("/admin/users/list");

    return { success: true };
  } catch (e: any) {
    return { error: e.message || "删除失败" };
  }
}
