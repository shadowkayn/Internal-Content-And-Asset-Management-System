import { connectDB } from "@/lib/db";
import systemSettingModel from "@/models/systemSetting.model";
import { Audit } from "@/lib/decorators";

export class SystemSettingsServer {
  @Audit("系统设置", "UPDATE", "保存系统设置")
  static async saveSystemConfig(data: any) {
    await connectDB();

    const { id, ...updateData } = data;

    if (!id) return await systemSettingModel.create(updateData);

    await systemSettingModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );
  }

  @Audit("系统设置", "UPDATE", "重制系统默认设置")
  static async setDefaultSystemConfig() {
    await connectDB();
    const params = {
      siteName: "KAYN ADMIN",
      siteLogo: "",
      copyright: `@${new Date().getFullYear()} KAYN`,
      allowRegister: true,
      loginOverTime: 5,
      fileSizeLimit: 5,
      storePath: "",
    };

    // 检查是否存在系统配置
    const existingConfig = await systemSettingModel.findOne({});

    if (existingConfig) {
      // 如果存在则更新
      return systemSettingModel.findByIdAndUpdate(
        existingConfig._id,
        { $set: params },
        { new: true, runValidators: true },
      );
    } else {
      // 如果不存在则创建
      return await systemSettingModel.create(params);
    }
  }

  static async getSystemConfig() {
    await connectDB();

    const config = await systemSettingModel.findOne({}).lean(); // 获取普通对象

    if (!config) {
      return null; // 或返回默认配置
    }

    return {
      ...config,
      id: config._id.toString(),
      _id: undefined,
    };
  }
}
