"use server";

import { connectDB } from "@/lib/db";
import Content from "@/models/content.model";
import { getCurrentUser } from "@/lib/auth";

export async function createContent(_: any, formData: FormData) {
  await connectDB();

  const user = await getCurrentUser();

  if (!user) {
    return { error: "未登录" };
  }

  // 权限不是写在页面里，而是在业务层
  if (user.role !== "viewer") {
    return { error: "无权限" };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await Content.create({
    title,
    content,
    // 防止越权的核心手段
    author: user._id,
  });

  return { success: true };
}

export async function listContents(page: number = 1, pageSize: number = 10) {
  await connectDB();

  const user = await getCurrentUser();

  if (!user) {
    return { error: "未登录" };
  }

  const filter: any = {};

  // editor 只能看到自己的编辑的内容
  // 数据层控制权限
  if (user.role === "editor") {
    filter.author = user._id;
  }

  const skip = (page - 1) * pageSize;

  // Content.find(filter)：根据过滤条件查询内容文档
  // .skip(skip)：跳过指定数量的文档，实现分页功能
  // .limit(pageSize)：限制返回的文档数量，控制每页大小
  // .populate("author", "username role")：关联查询作者信息，只返回 username 和 role 字段
  // .sort({ createdAt: -1 })：按创建时间降序排列，最新内容在
  const [list, total] = await Promise.all([
    Content.find(filter)
      .skip(skip)
      .limit(pageSize)
      .populate("author", "username role")
      .sort({ createdAt: -1 }),
    Content.countDocuments(filter),
  ]);

  return { list, total };
}

export async function updateContentStatus(contentId: string, status: string) {
  await connectDB();

  const user = await getCurrentUser();

  if (!user) {
    return { error: "未登录" };
  }

  if (user.role === "viewer") {
    return { error: "无权限" };
  }

  const content = await Content.findById(contentId);
  if (!content) {
    return { error: "内容不存在" };
  }
  if (
    content.author.toString() !== user._id.toString() &&
    user.role === "editor"
  ) {
    return { error: "无权操作他人内容" };
  }

  content.status = status;
  await content.save();

  return { success: true };
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

export async function updateContent(contentId: string, formData: FormData) {
  await connectDB();

  const user = await getCurrentUser();

  if (!user) {
    return { error: "未登录" };
  }

  if (user.role === "viewer") {
    return { error: "没有编辑权限" };
  }

  const content = await Content.findById(contentId);

  if (!content) {
    return { error: "内容不存在" };
  }

  // editor 只能修改自己创建的内容
  if (
    user.role === "editor" &&
    content.author.toString() !== user._id.toString()
  ) {
    return { error: "无权修改他人内容" };
  }

  const title = formData.get("title") as string;
  const body = formData.get("content") as string;

  content.title = title;
  content.content = body;

  await content.save();

  return { success: true };
}
