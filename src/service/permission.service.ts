import { connectDB } from "@/lib/db";
import PermissionModel from "@/models/permission.model";
import mongoose from "mongoose";
import { Audit } from "@/lib/decorators";

export class PermissionService {
  @Audit("权限点管理", "CREATE", "添加权限点")
  static async addPermission(data: any) {
    const existing = await PermissionModel.findOne({
      $or: [{ code: data.code }],
    });

    if (existing) {
      throw new Error(`权限点标识已存在`);
    }

    await connectDB();

    return await PermissionModel.create(data);
  }

  @Audit("权限点管理", "UPDATE", "更新权限点")
  static async updatePermission(data: any) {
    await connectDB();

    const { id, ...otherData } = data;

    const targetId = new mongoose.Types.ObjectId(id);
    const existing = await PermissionModel.findOne({
      code: otherData.code,
      _id: { $ne: targetId },
    });

    if (existing) {
      throw new Error(`权限点标识已存在`);
    }

    const result = await PermissionModel.findByIdAndUpdate(
      id,
      { $set: otherData },
      { new: true, runValidators: true },
    );

    if (!result) throw new Error("权限点不存在");

    return result.toObject();
  }

  @Audit("权限点管理", "DELETE", "删除权限点")
  static async deletePermission(ids: string[]) {
    await connectDB();

    if (!ids || ids.length === 0) {
      throw new Error("权限点ID不能为空");
    }

    // 批量删除
    return PermissionModel.updateMany(
      { _id: { $in: ids } },
      { $set: { deleteFlag: 1 } },
    );
  }

  static async getPermissionList(type?: "menu" | "") {
    await connectDB();

    const query: any = { deleteFlag: 0 };
    if (type) {
      query.type = type; // 根据 type 过滤
    }

    const rawList = await PermissionModel.find(query).sort({ sort: 1 }).lean();
    // 排序逻辑：先按类型(menu在前)，再按 sort(升序)
    // 因为 push 到 children 数组时是按顺序添加的，所以先排好序，生成的树就是有序的
    rawList.sort((a, b) => {
      // type 为 "menu" 的排在 "button" 前面
      if (a.type !== b.type) {
        return a.type === "menu" ? -1 : 1;
      }
      //同类型之间，按照 sort 字段升序排列
      const sortA = a.sort ?? 0;
      const sortB = b.sort ?? 0;
      return sortA - sortB;
    });

    // 格式化数据并建立映射表
    const itemMap: Record<string, any> = {};
    const formattedList = rawList.map((item: any) => {
      const node = {
        id: item._id.toString(),
        name: item.name,
        code: item.code,
        type: item.type,
        icon: item.icon,
        sort: item.type === "menu" ? item.sort : null,
        path: item.type === "menu" ? item.path : null,
        parentPath: item.parentPath,
        parentId: item.parentId,
        createdAt: item.createdAt?.toLocaleString("zh-CN"),
        updatedAt: item.updatedAt?.toLocaleString("zh-CN"),
        children: [], // 预留子节点数组
      };
      // 以 code 作为 key 存入 Map
      itemMap[node.code] = node;
      return node;
    });

    const tree: any[] = [];
    formattedList.forEach((item) => {
      const parentId = item.parentId;

      if (!parentId) {
        // 只有 parentId 真正为 null 的才是顶级节点
        tree.push(item);
      } else if (itemMap[parentId]) {
        // 只有父节点存在（未被删除）时，才挂载到父节点下
        itemMap[parentId].children.push(item);
      }
    });

    // 清理没有子节点的父节点children属性
    const removeEmptyChildren = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.children.length === 0) {
          delete node.children;
        } else {
          removeEmptyChildren(node.children);
        }
      });
    };
    removeEmptyChildren(tree);

    return { list: tree };
  }

  static async getButtonPermissionList() {
    await connectDB();

    const query: any = { deleteFlag: 0, type: "button" };
    const ButtonList = await PermissionModel.find(query).lean();
    return { list: ButtonList };
  }
}
