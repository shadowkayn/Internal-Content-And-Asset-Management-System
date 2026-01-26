import { NextRequest } from "next/server";
import { CloudinaryService } from "@/service/cloudinary.service";
import { error, success } from "@/lib/response";
// 使用 Node 自带的 Crypto 模块计算 Hash
import crypto from "crypto";
import AssetModel from "@/models/asset.model";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return error("请选择要上传的文件", 400);
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return error("不支持的文件类型", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      // 限制 5MB
      return error("文件大小不能超过 5MB", 400);
    }

    // 将 File 转化为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // 获取 Buffer 并计算文件 Hash (指纹)
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 去数据库查这个 Hash 是否已经存在
    const existingAsset: any = await AssetModel.findOne({ hash: fileHash });

    if (existingAsset) {
      // 情况A：如果存在，执行秒传逻辑，不走上传云端逻辑
      return success(
        {
          url: existingAsset.url,
          public_id: existingAsset.public_id,
        },
        "上传成功",
      );
    }

    // 情况B：如果不存在，执行正常上传逻辑
    // 调用 service 上传
    const result = await CloudinaryService.uploadStream(buffer);

    // 将新文件信息存入数据库
    await AssetModel.create({
      hash: fileHash,
      url: result.secure_url,
      publicId: result.public_id,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
    });

    return success(
      {
        url: result.secure_url, // Cloudinary 返回的 HTTPS 地址
        public_id: result.public_id, // 用于以后可能的删除操作
      },
      "上传成功",
    );
  } catch (e: any) {
    console.error("Upload Error:", error);
    return error(e.message || "上传失败", 500);
  }
}
