import { NextRequest } from "next/server";
import { CloudinaryService } from "@/service/cloudinary.service";
import { error, success } from "@/lib/response";

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

    // 调用 service 上传
    const result = await CloudinaryService.uploadStream(buffer);

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
