import mongoose, { Document, model, Schema } from "mongoose";

export interface IPermission extends Document {
  name: string; // 权限名称，如：新增用户
  code: string; // 权限唯一标识，如：user:add
  type: "menu" | "button"; // 权限类型：菜单或按钮
  parentId: string | null; // 父级权限 ID
  icon: string | null;
  deleteFlag: number;
  sort: number; // 排序
}

const PermissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      // 业务主键
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["menu", "button"],
      required: true,
    },
    parentId: {
      type: String,
      default: null,
      index: true,
    },
    icon: {
      type: String,
      default: null,
    },
    sort: {
      type: Number,
      default: 0,
    },
    deleteFlag: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const PermissionModel =
  mongoose.models.PermissionModel ||
  model<IPermission>("PermissionModel", PermissionSchema);

export default PermissionModel;
