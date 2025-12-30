// 这是 MongoDB 的 “内嵌（Embedding）” 模式。

import { Schema, models, model } from "mongoose";

// 定义具体的字典项（比如：男、女）
const dictItemSchema = new Schema({
  label: { type: String, required: true }, // 字典项名称，如：启动、关闭、暂停
  value: { type: String, required: true }, // 字典项值
  sort: { type: Number, default: 0 },
});

const sysDictTypeSchema = new Schema(
  {
    dictName: {
      type: String,
      required: true,
      unique: true,
      maxlength: 20,
    },
    dictCode: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
    },
    // 在这里直接存入字典项数组
    // 这样一个表里就既有“分类信息”，又有“具体选项”了
    dictData: [dictItemSchema],

    dictRemark: {
      type: String,
      default: "",
      maxlength: 500,
    },
    dictStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    deleteFlag: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const SysDictTypeModel =
  models.SysDictTypeModel || model("SysDictTypeModel", sysDictTypeSchema);
