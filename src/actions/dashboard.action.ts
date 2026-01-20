"use server";

import { StatisticsServer } from "@/service/statistics.server";

export async function getStatisticsAction() {
  try {
    const { contentCount, userCount, visitCount, todoCount } =
      await StatisticsServer.getStatistics();
    return {
      success: true,
      data: {
        contentCount,
        userCount,
        visitCount,
        todoCount,
      },
    };
  } catch (e: any) {
    return { error: e.emssage || "查询失败" };
  }
}

export async function getArticlesOfSevenDaysAction() {
  try {
    const res = await StatisticsServer.getContentStatisticsOfSevenDays();
    return { success: true, data: res };
  } catch (e: any) {
    return { error: e.message || "查询失败" };
  }
}

export async function getArticlesTypesAction() {
  try {
    const res = await StatisticsServer.getArticlesTypes();
    return { success: true, data: res };
  } catch (e: any) {
    return { error: e.message || "查询失败" };
  }
}
