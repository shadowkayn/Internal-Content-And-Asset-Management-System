"use server";

import { LogServer } from "@/service/log.server";

export const getLogListAction = async (params: any) => {
  try {
    const result = await LogServer.getLogList(params);
    return {
      success: true,
      data: result,
    };
  } catch (e: any) {
    return { error: e.message || "获取日志列表失败" };
  }
};
