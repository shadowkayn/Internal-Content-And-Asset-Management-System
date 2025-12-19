import * as mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

// 防止开发环境重复连接
// Next.js 开发模式会频繁热更新
// 不缓存连接 = MongoDB 被打爆
// 这段代码是 Next.js 官方级写法
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // 如果已经存在连接，则直接返回
  if (cached.conn) {
    return cached.conn;
  }

  // 如果没有正在建立的连接，则创建新的连接
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  // 等待连接建立并缓存结果
  cached.conn = await cached.promise;
  return cached.conn;
}
