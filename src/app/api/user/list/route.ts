import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { success, error } from "@/lib/response";
import { HttpError } from "@/lib/httpError";

export async function GET() {
  try {
    await connectDB();
    const list = await User.find();
    return success(list);
  } catch (e: any) {
    return error(e.message);
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.username) {
      // 这一步的意义是：
      // 不再 throw new Error("xxx")
      // 而是 throw new HttpError("xxx", 400)
      throw new HttpError("username is required", 400);
    }

    const user = await User.create(body);

    return success(user, "用户创建成功");
  } catch (e: any) {
    const status = e.statusCode || 500;
    return error(e.message, status);
  }
}
