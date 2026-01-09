"use server";

import { connectDB } from "@/lib/db";
import Content from "@/models/content.model";
import { getCurrentUser } from "@/lib/auth";
import { withAuthContext } from "@/lib/withContext";
import { z } from "zod";
import { ContentService } from "@/service/content.service";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";

const createContentSchema = z.object({
  title: z.string({ message: "标题不能为空" }).min(1, "标题不能为空"),
  content: z.string({ message: "内容不能为空" }).min(1, "内容不能为空"),
  status: z.string({ message: "状态不能为空" }).min(1, "状态不能为空"),
  category: z.string({ message: "分类不能为空" }).min(1, "分类不能为空"),
});

const editContentSchema = createContentSchema.extend({
  id: z.string({ message: "ID 不能为空" }).min(1, "ID 不能为空"),
});

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
  console.log(validatedFields, "validatedFields");

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
  await connectDB();

  const user = await getCurrentUser();

  if (!user) {
    return { error: "未登录" };
  }

  const content = await Content.findById(contentId).populate(
    "author",
    "username role",
  );

  if (!content) {
    return { error: "内容不存在" };
  }

  // editor 只能看到自己创建的内容
  if (
    user.role === "editor" &&
    content.author.toString() !== user._id.toString()
  ) {
    return { error: "无权查看他人内容" };
  }

  return { data: content };
}
