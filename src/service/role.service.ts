import { connectDB } from "@/lib/db";
import RoleModel from "@/models/role.model";

export class RoleService {
  static async createRole(data: any) {
    const existing = await RoleModel.findOne({
      $or: [{ code: data.code }],
    });

    if (existing) {
      throw new Error(`角色已存在`);
    }

    await connectDB();

    return await RoleModel.create(data);
  }

  static async updateRole(data: any) {
    await connectDB();

    const { id, ...otherData } = data;

    const existing = await RoleModel.findOne({
      $or: [{ code: data.code }],
      _id: { $ne: id },
    });

    if (existing) {
      throw new Error(`角色已存在`);
    }

    const result = await RoleModel.findByIdAndUpdate(
      id,
      { $set: otherData },
      { new: true, runValidators: true },
    );
    if (!result) throw new Error("角色不存在");

    return result.toObject();
  }

  static async updateRoleStatus(data: any) {
    await connectDB();

    const { id, status } = data;
    return RoleModel.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      { new: true, runValidators: true },
    );
  }

  static async deleteRole(ids: string[]) {
    await connectDB();

    return RoleModel.updateMany(
      { _id: { $in: ids } },
      { $set: { deleteFlag: 1 } },
    );
  }

  static async getRoleList(params: any) {
    await connectDB();

    const { page, pageSize, status, keywords, options } = params;

    const query: any = { deleteFlag: 0 };
    if (status) {
      query.status = status;
    }
    if (keywords) {
      query.$or = [
        { name: { $regex: keywords, $options: "i" } }, // 匹配角色名称
        { code: { $regex: keywords, $options: "i" } }, // 匹配角色标识
      ];
    }

    let list = [],
      total = 0;

    if (options === "all") {
      // 全量查询
      list = await RoleModel.find(query)
        .sort({ createdAt: -1 })
        .lean()
        .transform((doc) => {
          return doc.map((item: any) => ({
            ...item,
            id: item._id.toString(),
            _id: undefined,
            createdAt: item.createdAt?.toLocaleString("zh-CN"),
            updatedAt: item.updatedAt?.toLocaleString("zh-CN"),
          }));
        });
      total = list.length;
    } else {
      const skip = (page - 1) * pageSize;

      [list, total] = await Promise.all([
        RoleModel.find(query)
          .skip(skip)
          .limit(pageSize)
          .sort({ createdAt: -1 })
          .lean()
          .transform((doc) => {
            return doc.map((item: any) => ({
              ...item,
              id: item._id.toString(),
              _id: undefined,
              createdAt: item.createdAt?.toLocaleString("zh-CN"),
              updatedAt: item.updatedAt?.toLocaleString("zh-CN"),
            }));
          }),
        RoleModel.countDocuments(query),
      ]);
    }

    return { list, total };
  }
}
