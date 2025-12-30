"use server";

import { SysDictService } from "@/service/sysDict.service";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
// Zod校验库，Next.js 社区的标准配置
import { z } from "zod";

// 定义数据格式
const dictSchema = z.object({
  dictCode: z
    .string()
    .regex(
      /^sys_[a-zA-Z0-9_]+$/,
      "字典编码必须以 sys_ 开头，后面可跟字母、数字、下划线",
    ),
  dictName: z.string().min(1, "请输入字典名称"),
  dictStatus: z.enum(
    ["active", "inactive"],
    "状态参数无效，请输入active或inactive",
  ),
});

// 状态枚举校验
const updateStatusSchema = z.object({
  id: z.string().min(1, "ID不能为空"),
  dictStatus: z.enum(
    ["active", "inactive"],
    "状态参数无效，请输入active或inactive",
  ),
});

export async function addDictAction(rawData: any) {
  // 字段校验放在actions层里面
  // 格式校验
  const validatedFields = dictSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    // 格式没问题，才交给 Service 去处理业务逻辑（如查重）
    await SysDictService.createDict(rawData);

    // 关键点：告诉 Next.js 刷新这个路由的数据缓存
    revalidatePath("/admin/system/dictionary");

    return { success: true };
  } catch (e: any) {
    return { error: e.message || "服务器繁忙" };
  }
}

export async function updateDictBasicInfoAction(params: any) {
  const validatedFields1 = updateStatusSchema.safeParse(params);
  const validatedFields2 = dictSchema.safeParse(params);
  if (!validatedFields1.success) {
    return { error: validatedFields1.error.issues[0].message };
  }
  if (!validatedFields2.success) {
    return { error: validatedFields2.error.issues[0].message };
  }

  try {
    await SysDictService.updateDictBasicInfo(params);
    revalidatePath("/admin/system/dictionary");

    return { success: true };
  } catch (e: any) {
    return { error: e.message || "更新失败" };
  }
}

export async function updateDictDataAction(
  id: string,
  dictData: Array<{
    _id?: string;
    label: string;
    value: string;
  }>,
) {
  // dictData 是字典项数组，新增项没有 _id，编辑项有 _id
  for (const item of dictData) {
    // 对每项数据进行校验
    if (!item.label || !item.value) {
      return { error: "字典项的标签和值不能为空" };
    }
  }

  try {
    await SysDictService.updateDictData(id, dictData);
    revalidatePath("/admin/system/dictionary");

    return { success: true };
  } catch (e: any) {
    return { error: e.message || "更新失败" };
  }
}

export async function getDictDataListAction(id: string) {
  try {
    const result = await SysDictService.getDictDataList(id);
    return { success: true, list: result };
  } catch (e) {
    return { error: "查询失败" };
  }
}

export async function deleteDictAction(ids: string[]) {
  try {
    await SysDictService.deleteDict(ids);
    revalidatePath("/admin/system/dictionary");
    return { success: true };
  } catch (e: any) {
    return { error: "删除失败" };
  }
}

export async function updateDictStatus(params: any) {
  // 使用 Zod 校验参数
  const validatedFields = updateStatusSchema.safeParse(params);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { id, dictStatus } = validatedFields.data;

  try {
    await SysDictService.updateDictStatus(id, dictStatus);
    revalidatePath("/admin/system/dictionary");

    return { success: true };
  } catch (e: any) {
    return { error: e.message || "更新失败" };
  }
}

export async function getDictListAction(params: any) {
  // 参数校验
  const pageNum = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  // 参数验证
  if (pageNum < 1 || pageSize < 1 || pageSize > 100) {
    return { error: "分页参数无效" };
  }

  try {
    const validatedParams = {
      ...params,
      pageNum,
      pageSize,
    };

    const { list, total } = await SysDictService.getDictList(validatedParams);
    return { list, total, success: true };
  } catch (e: any) {
    return { error: "查询失败" };
  }
}
