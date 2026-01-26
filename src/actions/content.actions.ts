"use server";

import { withAuthContext } from "@/lib/withContext";
import { z } from "zod";
import { ContentService } from "@/service/content.service";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";

const createContentSchema = z
  .object({
    title: z.string({ message: "标题不能为空" }).min(1, "标题不能为空"),
    content: z.string({ message: "内容不能为空" }).min(1, "内容不能为空"),
    status: z.string({ message: "状态不能为空" }).min(1, "状态不能为空"),
    category: z.string({ message: "分类不能为空" }).min(1, "分类不能为空"),
    description: z.string({ message: "描述不能为空" }).min(1, "描述不能为空"),
  })
  .passthrough();

const editContentSchema = createContentSchema
  .extend({
    id: z.string({ message: "ID 不能为空" }).min(1, "ID 不能为空"),
  })
  .passthrough();

export const createContentAction = withAuthContext(async (data: any) => {
  // 使用 zod 校验参数
  const validatedFields = createContentSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    await ContentService.createContent(validatedFields.data);
    revalidatePath("/admin/content/list");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "创建失败" };
  }
});

export const updateContentAction = withAuthContext(async (data: any) => {
  // 使用 zod 校验参数
  const validatedFields = editContentSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    await ContentService.updateContent(validatedFields.data);
    revalidatePath("/admin/content/list");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "更新失败" };
  }
});

export const getArticleListAction = withAuthContext(async (params: any) => {
  try {
    const result = await ContentService.getContentList(params);
    return { success: true, data: result };
  } catch (e: any) {
    return { error: e.message || "获取列表失败" };
  }
});

export async function deleteContentAction(ids: string[]) {
  try {
    await ContentService.deleteContent(ids);
    revalidatePath("/admin/content/list");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "删除失败" };
  }
}

// 为什么“查看详情”也要鉴权？ 详情接口是独立的攻击面
export async function getContentDetail(contentId: string) {
  try {
    const result = await ContentService.getContentDetail(contentId);

    return { success: true, data: result };
  } catch (e: any) {
    return { error: e.message || "获取详情失败" };
  }
}
