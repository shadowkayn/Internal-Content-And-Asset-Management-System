import { v2 as cloudinary } from "cloudinary";

// 配置
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  static async uploadStream(
    buffer: Buffer,
    folder: string = "kayn_admin",
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto", // 自动识别图片、视频或文档
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      // 将 Buffer 写入流
      uploadStream.end(buffer);
    });
  }
}
