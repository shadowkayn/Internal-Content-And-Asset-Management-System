import { connectDB } from "@/lib/db";
import ContentModel from "@/models/content.model";
import UserModel from "@/models/user.model";
import { SysDictService } from "@/service/sysDict.service";

export class StatisticsServer {
  static async getStatistics() {
    await connectDB();

    const [contentCount, userCount, visitCount, todoCount] = await Promise.all([
      ContentModel.countDocuments(),
      UserModel.countDocuments(),
      Math.round(Math.random() * 1000),
      Math.round(Math.random() * 100),
    ]);

    return {
      contentCount,
      userCount,
      visitCount,
      todoCount,
    };
  }

  static async getContentStatisticsOfSevenDays() {
    await connectDB();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // 聚合查询
    const contentStats = await ContentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              // 强制按中国时区转换日期
              timezone: "Asia/Shanghai",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 将查询结果转为 Map，方便快速查找
    const statsMap = new Map(
      contentStats.map((item) => [item._id, item.count]),
    );

    // 循环生成最近 7 天的完整数据
    const result = [];
    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(startDate);
      tempDate.setDate(startDate.getDate() + i);

      // 格式化日期字符串 yyyy-mm-dd
      const dateStr = tempDate.toISOString().split("T")[0];

      result.push({
        date: dateStr,
        count: statsMap.get(dateStr) || 0, // 如果 Map 里没有，则补 0
      });
    }

    return result;
  }

  // 内容分类占比
  static async getArticlesTypes() {
    await connectDB();

    // 获取内容分类统计数据
    const typeStats = await ContentModel.aggregate([
      {
        $group: {
          _id: "$category", // 使用 category 字段进行分类
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id", // 将 _id 重命名为 type
          value: "$count", // 将 count 重命名为 value
        },
      },
      {
        $sort: { value: -1 }, // 按数量降序排列
      },
    ]);

    // 如果没有分类数据，返回[]
    if (typeStats.length === 0) {
      return [];
    }

    // 获取字典数据，用于转换分类编码为中文名称
    let dictData = [];
    try {
      const dictResult = await SysDictService.getDictDataList(
        "sys_content_category",
      );
      dictData = dictResult.dictData;
    } catch (error) {
      // 如果字典不存在，继续使用原始数据
      console.warn("字典不存在，使用原始分类数据:", error);
    }

    // 创建字典映射表
    const dictMap = new Map(
      dictData.map((item: any) => [item.value, item.label]),
    );

    // 将分类编码转换为中文名称
    return typeStats.map((item: any) => ({
      type: dictMap.get(item.type) || item.type,
      value: item.value,
    }));
  }
}
