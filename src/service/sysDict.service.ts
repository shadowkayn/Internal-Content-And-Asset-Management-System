"use server";

import { connectDB } from "@/lib/db";
import { SysDictTypeModel } from "@/models/sysDictType.model";

export class SysDictService {
  // add
  static async createDict(data: any) {
    await connectDB();

    // 复杂业务逻辑校验，因为要查询数据库
    // 字段级校验放在action层里
    const existing = await SysDictTypeModel.findOne({
      $or: [{ dictCode: data.dictCode }, { dictName: data.dictName }],
    });
    if (existing) {
      const field = existing.dictCode === data.dictCode ? "编码" : "名称";
      throw new Error(`字典${field}已存在`);
    }

    // 数据库操作
    return await SysDictTypeModel.create(data);
  }

  // updateBasicInfo
  static async updateDictBasicInfo(data: any) {
    await connectDB();

    // 排除掉 dictData，防止误操作覆盖子表
    const { id, dictData, ...basicInfo } = data;

    // 直接使用 $set 局部更新即可
    const result = await SysDictTypeModel.findByIdAndUpdate(
      { _id: id },
      { $set: basicInfo },
      { new: true, runValidators: true },
    );

    if (!result) throw new Error("字典不存在");
    return result;
  }

  // updateDictData
  static async updateDictData(id: string, newDictData: any) {
    await connectDB();

    // 直接将整个数组替换为前端传来的新数组
    const result = await SysDictTypeModel.findByIdAndUpdate(
      { _id: id },
      { $set: { dictData: newDictData } },
      { new: true },
    );

    if (!result) throw new Error("字典不存在");
    return result;
  }

  // getDictDataList
  static async getDictDataList(id: string) {
    await connectDB();

    return SysDictTypeModel.findById(id).select("dictData");
  }

  // delete
  static async deleteDict(ids: string[]) {
    await connectDB();

    if (!ids || ids.length === 0) {
      throw new Error("请选择要删除的字典");
    }

    // 查询是否存在
    const existingCount = await SysDictTypeModel.countDocuments({
      _id: { $in: ids },
    });

    if (existingCount !== ids.length) {
      throw new Error("部分字典不存在");
    }

    // 批量更新删除标志
    return SysDictTypeModel.updateMany(
      { _id: { $in: ids } },
      { $set: { deleteFlag: 1 } },
    );
  }

  // list
  static async getDictList(params: any) {
    await connectDB();

    const { page, pageSize, dictName, dictCode } = params;
    const query: any = {};
    const skip = (page - 1) * pageSize;

    // $regex：MongoDB 正则表达式操作符，用于模糊匹配
    // $options: "i"：不区分大小写的匹配选项
    if (dictName) {
      query.dictName = { $regex: dictName, $options: "i" };
    }
    if (dictCode) {
      query.dictCode = { $regex: dictCode, $options: "i" };
    }
    query.deleteFlag = 0;

    const [list, total] = await Promise.all([
      SysDictTypeModel.find(query)
        .skip(skip)
        .limit(pageSize)
        .sort({ createTime: -1 }),
      SysDictTypeModel.countDocuments(query),
    ]);

    return { list, total };
  }

  // update status
  static async updateDictStatus(id: string, status: string) {
    await connectDB();

    const existing = await SysDictTypeModel.findById(id);
    if (!existing) {
      throw new Error("字典不存在");
    }
    return SysDictTypeModel.findByIdAndUpdate(id, { status });
  }
}
