import { connectDB } from "@/lib/db";
import UserModel from "@/models/user.model";
import { hashPassword } from "@/lib/password";

export class UserListService {
  // add
  static async createUser(data: any) {
    await connectDB();
    const { username, email, phone } = data;
    // 唯一性校验
    const existing = await UserModel.findOne({
      $or: [{ username }, { email }, { phone }],
    });
    if (existing) {
      const field =
        existing.username === username
          ? "用户名"
          : existing.email === email
            ? "邮箱"
            : "手机号";
      throw new Error(`用户${field}已存在`);
    }
    const result: any = await UserModel.create(data);
    // 返回时不包含密码字段
    const { password, ...reset } = result.toObject();
    return reset;
  }

  // list
  static async getUserList(params: any) {
    await connectDB();

    const { username, status, page = 1, pageSize = 10 } = params;
    const query: any = {};
    const skip = (page - 1) * pageSize;

    // $regex：MongoDB 正则表达式操作符，用于模糊匹配
    // $options: "i"：不区分大小写的匹配选项
    if (username) {
      query.username = { $regex: username, $options: "i" };
    }
    // 只有当 status 有值（不为空字符串且不是 undefined）时才加入查询条件
    if (status !== undefined && status !== "" && status !== null) {
      query.status = status;
    }
    query.deleteFlag = 0;

    const [list, total] = await Promise.all([
      UserModel.find(query)
        .skip(skip)
        .limit(pageSize)
        .sort({ createTime: -1 })
        .select("-password")
        .lean() // 使用 lean() 返回普通对象,
        .transform((doc) => {
          return doc.map((item) => ({
            ...item,
            id: item._id.toString(),
            _id: undefined,
            avatar: item.avatar || null,
            createdAt: new Date(item.createdAt)?.toLocaleString("zh-CN"),
            updatedAt: new Date(item.updatedAt)?.toLocaleString("zh-CN"),
          }));
        }),
      UserModel.countDocuments(query),
    ]);

    return { list, total };
  }

  // edit
  static async updateUser(data: any) {
    await connectDB();

    console.log("data", data);
    const { id, username, password, ...updateData } = data;

    if (!id) throw new Error("用户ID不能为空");

    // 唯一性校验 (针对 email 和 phone)
    // 如果用户修改了邮箱或手机号，需要检查新值是否被其他人占用
    const orConditions: any = [];
    if (updateData.email) {
      orConditions.push({ email: updateData.email });
    }
    if (updateData.phone) {
      orConditions.push({ phone: updateData.phone });
    }

    if (orConditions.length > 0) {
      const existing = await UserModel.findOne({
        $or: orConditions,
        _id: { $ne: id }, // 排除当前用户自己
      });

      if (existing) {
        const field = existing.email === updateData.email ? "邮箱" : "手机号";
        throw new Error(`该${field}已被其他用户占用`);
      }

      const result = await UserModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      ).select("-password");

      if (!result) throw new Error("用户不存在");

      return result.toObject();
    }
  }

  // update password
  static async updateUserPassword(id: string, password: string) {
    await connectDB();
    // 先对密码进行加密处理 bcrypt 处理

    if (!id) throw new Error("用户ID不能为空");
    if (!password || password.length < 6) {
      throw new Error("密码长度不能小于6位");
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error("用户不存在");
    }

    const hashedPassword = await hashPassword(password);

    // 只需要更新 password 字段
    await UserModel.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { runValidators: true },
    );

    return { success: true, message: "密码修改成功" };
  }

  // delete
  static async deleteUser(ids: string[]) {
    await connectDB();

    if (!ids || ids.length === 0) {
      throw new Error("用户ID不能为空");
    }

    // 批量更新删除标志
    return UserModel.updateMany(
      { _id: { $in: ids } },
      { $set: { deleteFlag: 1 } },
    );
  }
}
