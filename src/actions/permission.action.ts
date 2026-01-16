"use server";

import { PermissionService } from "@/service/permission.service";
import { z } from "zod";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";

const createRootPermissionSchema = z.object({
  name: z.string().min(1, "权限名称不能为空"),
  code: z.string().min(1, "权限标识不能为空"),
  type: z.enum(["menu", "button"], "权限类型无效，请传入 menu 或 button"),
});

const editRootPermissionSchema = createRootPermissionSchema.extend({
  id: z.string().min(1, "ID不能为空"),
});

const createPermissionSchema = createRootPermissionSchema.extend({
  parentId: z.string().min(1, "父节点标识不能为空"),
});

const editPermissionSchema = createPermissionSchema.extend({
  id: z.string().min(1, "ID不能为空"),
});

export const addPermissionAction = async (data: any) => {
  const { parentId } = data;
  const createContentSchema = parentId
    ? createPermissionSchema
    : createRootPermissionSchema;

  const validatedFields = createContentSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    await PermissionService.addPermission(data);
    revalidatePath("/admin/system/permission");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "添加权限失败" };
  }
};

export const updatePermissionAction = async (data: any) => {
  const { parentId } = data;
  const editContentSchema = parentId
    ? editPermissionSchema
    : editRootPermissionSchema;
  const validatedFields = editContentSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    await PermissionService.updatePermission(data);
    revalidatePath("/admin/system/permission");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "更新权限失败" };
  }
};

export const deletePermissionAction = async (ids: string[]) => {
  try {
    await PermissionService.deletePermission(ids);
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "删除权限失败" };
  }
};

export const getPermissionListAction = async () => {
  try {
    const result = await PermissionService.getPermissionList();
    return { success: true, data: result };
  } catch (e: any) {
    return { error: e.message || "获取权限列表失败" };
  }
};
