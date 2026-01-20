"use server";

import { SystemSettingsServer } from "@/service/systemSettings.server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";

export async function saveSystemConfigAction(data: any) {
  try {
    await SystemSettingsServer.saveSystemConfig(data);
    revalidatePath("/admin/system/settings");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "保存配置失败" };
  }
}

export async function getSystemConfigAction() {
  try {
    const data = await SystemSettingsServer.getSystemConfig();
    return { success: true, data };
  } catch (e: any) {
    return { error: e.message || "获取配置失败" };
  }
}

export async function setDefaultSystemConfigAction() {
  try {
    await SystemSettingsServer.setDefaultSystemConfig();
    revalidatePath("/admin/system/settings");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "设置默认配置失败" };
  }
}
