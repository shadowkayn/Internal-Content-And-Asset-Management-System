import { connectDB } from "@/lib/db";
import UserModel from "@/models/user.model";
import { hashPassword, comparePassword } from "@/lib/password";
import { Audit } from "@/lib/decorators";
import { userStorage } from "@/lib/context";

export class UserListService {
  @Audit("用户管理", "CREATE", "创建用户")
  static async createUser(data: any) {
    await connectDB();
    const { username, email, phone, password } = data;
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

    // 密码加密
    const hashedPassword = await hashPassword(password);
    const userData = {
      ...data,
      password: hashedPassword,
    };

    const result: any = await UserModel.create(userData);
    // 返回时不包含密码字段
    const { password: _, ...reset } = result.toObject();
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

  @Audit("用户管理", "UPDATE", "更新用户信息")
  static async updateUser(data: any) {
    await connectDB();

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

  @Audit("用户管理", "UPDATE", "修改用户密码")
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

  @Audit("用户管理", "UPDATE", "更新个人资料")
  static async updateProfile(data: any) {
    await connectDB();

    const store = userStorage.getStore();
    const currentUserId = store?.userId;

    if (!currentUserId) {
      throw new Error("用户未登录");
    }

    const { email, phone, ...otherData } = data;

    // 唯一性校验 (针对 email 和 phone)
    const orConditions: any = [];
    if (email) {
      orConditions.push({ email });
    }
    if (phone) {
      orConditions.push({ phone });
    }

    if (orConditions.length > 0) {
      const existing = await UserModel.findOne({
        $or: orConditions,
        _id: { $ne: currentUserId }, // 排除当前用户自己
      });

      if (existing) {
        const field = existing.email === email ? "邮箱" : "手机号";
        throw new Error(`该${field}已被其他用户占用`);
      }
    }

    const result = await UserModel.findByIdAndUpdate(
      currentUserId,
      { $set: { ...otherData, email, phone } },
      { new: true, runValidators: true },
    ).select("-password");

    if (!result) throw new Error("用户不存在");

    return result.toObject();
  }

  @Audit("用户管理", "UPDATE", "修改个人密码")
  static async updatePassword(oldPassword: string, newPassword: string) {
    await connectDB();

    const store = userStorage.getStore();
    const currentUserId = store?.userId;

    if (!currentUserId) {
      throw new Error("用户未登录");
    }

    const user = await UserModel.findById(currentUserId);
    if (!user) {
      throw new Error("用户不存在");
    }

    // 验证当前密码
    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      throw new Error("当前密码错误");
    }

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码
    await UserModel.findByIdAndUpdate(
      currentUserId,
      { $set: { password: hashedPassword } },
      { runValidators: true },
    );

    return { success: true, message: "密码修改成功" };
  }

  @Audit("用户管理", "DELETE", "删除用户")
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
