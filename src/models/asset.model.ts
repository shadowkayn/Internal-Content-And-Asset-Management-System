import { Model, model, models, Schema } from "mongoose";

// 基于文件指纹（Hash）的“秒传”逻辑
// 计算 Hash：后端接收到文件后，先计算文件的 MD5 或 SHA-256 值（这就像文件的身份证，内容不变，Hash 就不变）。
// 查询数据库：在 MongoDB 中建立一个 Assets（素材）表，记录每个已上传文件的 Hash 值和对应的 URL。
// 判断去向：
//  1.如果 Hash 已存在：直接返回数据库里存的 URL，不再调用 Cloudinary 接口（实现秒传）。
//  2.如果 Hash 不存在：调用 Cloudinary 上传，成功后将 Hash 和 URL 存入数据库。

interface AssetType extends Document {
  hash: string;
  url: string;
  publicId: string;
  fileName?: string;
  size?: number;
  mimeType?: string;
}

const AssetSchema = new Schema(
  {
    hash: { type: String, required: true, index: true }, // 文件指纹
    url: { type: String, required: true }, // 云端地址
    publicId: { type: String, required: true }, // Cloudinary 的 ID (方便以后删除)
    fileName: String, // 原始文件名
    size: Number, // 文件大小
    mimeType: String, // 文件类型
  },
  { timestamps: true },
);

const AssetModel: Model<AssetType> =
  models.AssetModel || model("AssetModel", AssetSchema);

export default AssetModel;
