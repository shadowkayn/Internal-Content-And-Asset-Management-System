import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILog extends Document {
  module: string; // 模块：内容管理、用户管理等
  action: string; // 操作：CREATE, UPDATE, DELETE, LOGIN
  description: string; // 描述：修改了文章《XXX》
  operator: string; // 操作人：用户名
  ip: string; // 访问IP
  location: string;
  status: "success" | "fail";
  params: string; // 请求参数 (JSON字符串)
  duration: number; // 耗时 (ms)
  errorMsg?: string; // 错误信息
  deleteFlag: number;
}

const LogSchema = new Schema(
  {
    module: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    operator: { type: String, required: true },
    ip: { type: String, default: "未知" },
    location: { type: String, default: "未知" },
    status: { type: String, enum: ["success", "fail"], default: "success" },
    params: { type: String },
    duration: { type: Number },
    errorMsg: { type: String },
    deleteFlag: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const LogModel: Model<ILog> =
  mongoose.models.LogModel || mongoose.model("LogModel", LogSchema);
export default LogModel;
