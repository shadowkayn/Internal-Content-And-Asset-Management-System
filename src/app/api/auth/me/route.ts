import { getCurrentUser } from "@/lib/auth";
import { error, success } from "@/lib/response";

export async function GET() {
  try {
    const user: any = await getCurrentUser();

    if (!user) {
      return error("未登录", 401);
    }

    // 返回用户信息，排除敏感字段
    // toObject() 是 Mongoose 模型实例的一个方法，将 Mongoose 文档实例转换为普通的 JavaScript 对象
    // const { password, ...userWithoutPassword } = user.toObject();

    return success(user);
  } catch (e) {
    return error("获取用户信息失败", 500);
  }
}
