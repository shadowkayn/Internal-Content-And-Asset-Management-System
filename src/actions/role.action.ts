"use server";

import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { RoleService } from "@/service/role.service";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string("角色名称不能为空").min(1, "角色名称不能为空"),
  code: z.string("角色标识不能为空").min(1, "角色标识不能为空"),
  description: z.string("角色描述不能为空").min(1, "角色描述不能为空"),
  status: z.enum(["active", "disabled"], "状态无效，请传入 active 或 disabled"),
});

const editRoleSchema = createRoleSchema.extend({
  id: z.string({ message: "角色 ID 不能为空" }).min(1, "角色 ID 不能为空"),
});

export const createRoleAction = async (data: any) => {
  const validatedFields = createRoleSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    await RoleService.createRole(data);
    revalidatePath("/admin/users/roles");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "创建角色失败" };
  }
};

export const editRoleAction = async (data: any) => {
  const validatedFields = editRoleSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    await RoleService.updateRole(data);
    revalidatePath("/admin/users/roles");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "更新角色失败" };
  }
};

export const deleteRoleAction = async (ids: string[]) => {
  try {
    await RoleService.deleteRole(ids);
    revalidatePath("/admin/users/roles");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "删除角色失败" };
  }
};

export const updateRoleStatusAction = async (data: any) => {
  try {
    await RoleService.updateRoleStatus(data);
    revalidatePath("/admin/users/roles");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "更新角色状态失败" };
  }
};

export const getRoleListAction = async (params: any) => {
  try {
    const data = await RoleService.getRoleList(params);
    return { success: true, data };
  } catch (e: any) {
    return { error: e.message || "获取角色列表失败" };
  }
};
