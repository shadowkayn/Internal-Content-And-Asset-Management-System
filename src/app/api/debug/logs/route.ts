import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import LogModel from "@/models/log.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "2");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;
    const query = { deleteFlag: 0 };

    // 直接查询，不做任何转换
    const rawDocs = await LogModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    // 尝试转换每一条，看哪条有问题
    const results = [];
    for (let i = 0; i < rawDocs.length; i++) {
      try {
        const item: any = rawDocs[i];
        const transformed = {
          ...item,
          id: item._id.toString(),
          _id: item._id.toString(), // 保留原始 _id 用于调试
          createdAt: item.createdAt?.toLocaleString("zh-CN"),
          updatedAt: item.updatedAt?.toLocaleString("zh-CN"),
        };
        results.push(transformed);
      } catch (e: any) {
        console.error(`❌ [Debug] Item ${i} failed:`, e.message);
        results.push({
          error: `Item ${i} failed: ${e.message}`,
          rawData: rawDocs[i],
        });
      }
    }

    return NextResponse.json({
      success: true,
      page,
      skip,
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error("❌ [Debug] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
