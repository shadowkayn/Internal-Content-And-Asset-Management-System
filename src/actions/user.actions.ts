"use server";

import { UserListService } from "@/service/userList.service";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(
    ["active", "disabled"],
    "状态参数无效，请输入active或disabled",
  ),
});

// add
export async function addUserAction(data: any) {
  const validatedData = statusSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: validatedData.error.issues[0].message };
  }

  try {
    await UserListService.createUser(data);
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
  const validatedData = statusSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: validatedData.error.issues[0].message };
  }

  try {
    await UserListService.updateUser(data);
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
