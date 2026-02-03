import { connectDB } from "@/lib/db";
import LogModel from "@/models/log.model";

export class LogServer {
  static async getLogList(params: any) {
    await connectDB();
    const {
      page = 1,
      pageSize = 10,
      logModule,
      startTime,
      endTime,
      username,
    } = params;

    const skip = (page - 1) * pageSize;
    const query: any = { deleteFlag: 0 };
    if (logModule) {
      query.logModule = logModule;
    }
    if (startTime && endTime) {
      const startOfDay = new Date(`${startTime}T00:00:00.000Z`);
      const endOfDay = new Date(`${endTime}T23:59:59.999Z`);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }
    if (username) {
      query.operator = username;
    }

    const list = await LogModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await LogModel.countDocuments(query);

    return {
      list: list.map((item: any) => ({
        ...item,
        id: item._id.toString(),
        _id: undefined,
        createdAt: item.createdAt?.toLocaleString("zh-CN"),
        updatedAt: item.updatedAt?.toLocaleString("zh-CN"),
      })),
      total,
    };
  }
}
