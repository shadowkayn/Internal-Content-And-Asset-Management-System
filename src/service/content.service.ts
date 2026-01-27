import { connectDB } from "@/lib/db";
import ContentModel from "@/models/content.model";
import { userStorage } from "@/lib/context";
import { Audit } from "@/lib/decorators";

export class ContentService {
  @Audit("内容管理", "创建文章", "创建文章")
  static async createContent(data: any) {
    const store = userStorage.getStore();
    const currentUserId = store?.userId;

    if (!currentUserId) {
      throw new Error("用户未登录");
    }

    await connectDB();

    const existing = await ContentModel.findOne({
      $or: [{ title: data.title }],
    });

    if (existing) {
      throw new Error(`文章标题已存在`);
    }

    const finalData = {
      ...data,
      author: currentUserId,
    };

    return await ContentModel.create(finalData);
  }

  @Audit("内容管理", "更新文章", "更新文章")
  static async updateContent(data: any) {
    const store = userStorage.getStore();
    const currentUserId = store?.userId;

    if (!currentUserId) {
      throw new Error("用户未登录");
    }

    await connectDB();

    const { id, ...contentData } = data;

    const orConditions: any = [{ title: contentData.title }];

    const existing = await ContentModel.findOne({
      $or: orConditions,
      _id: { $ne: id },
    });

    if (existing) {
      throw new Error(`文章标题已存在`);
    }

    // 从数据库获取当前文章，保留 author 信息
    const currentContent = await ContentModel.findById(id);
    if (!currentContent) {
      throw new Error("文章不存在");
    }

    // 合并数据，保留原作者，添加更新人和更新时间
    const updateData = {
      ...contentData,
      author: currentContent.author, // 保持原作者不变
      updater: currentUserId, // 记录更新人
      updatedAt: new Date(), // 更新时间
    };

    const result = await ContentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!result) throw new Error("文章不存在");

    return result.toObject();
  }

  @Audit("内容管理", "删除文章", "删除文章")
  static async deleteContent(ids: string[]) {
    await connectDB();

    if (!ids || ids.length === 0) {
      throw new Error("文章ID不能为空");
    }

    // 批量删除
    return ContentModel.updateMany(
      { _id: { $in: ids } },
      { $set: { deleteFlag: 1 } },
    );
  }

  static async getContentList(params: any) {
    await connectDB();

    const { userId, role } = userStorage.getStore() || {};

    const { title, status, category, page = 1, pageSize = 10 } = params;

    const andConditions: any = [{ deleteFlag: 0 }];

    if (role === "admin") {
      // 全量数据
      // 如果前端传了 status（比如管理员在下拉框选了“已归档”），那就查对应的状态
      if (status) {
        andConditions.push({ status });
      } else {
        // 如果前端没传 status（默认进页面），帮管理员隐藏归档，让他看“有用的”东西
        andConditions.push({ status: { $ne: "archived" } });
      }
    } else if (role === "editor") {
      // 编辑者：自己所有的文章 OR 别人已发布的文章（不看别人的归档）
      if (status) {
        // 如果编辑者选了状态，必须同时满足：[该状态] 且 [是自己写的 OR 别人已发布的]
        // 这样即便他搜 status=archived，也只能搜到他自己的归档
        andConditions.push({ status });
        andConditions.push({
          $or: [{ author: userId }, { status: "published" }],
        });
      } else {
        // 默认情况：看自己所有的 + 别人发布的（不看别人的归档和草稿）
        andConditions.push({
          $or: [{ author: userId }, { status: "published" }],
        });
      }
    } else {
      // 浏览者：只能查看已发布的文章
      andConditions.push({ status: "published" });
    }

    if (title) {
      andConditions.push({ title: { $regex: title, $options: "i" } });
    }
    if (category) {
      andConditions.push({ category });
    }

    const query = { $and: andConditions };

    const skip = (page - 1) * pageSize;

    // 这种写法比递归快得多，因为它不涉及函数调用栈和循环判断
    const formatList = (list: any) => {
      const result = [];
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        result.push({
          id: item._id.toString(),
          title: item.title,
          status: item.status,
          category: item.category,
          description: item.description,
          cover: item.cover,
          content: item.content,
          createdAt: item.createdAt?.toLocaleString("zh-CN"),
          updatedAt: item.updatedAt?.toLocaleString("zh-CN"),
          // 精确处理子对象
          author: item.author
            ? {
                id: item.author._id.toString(),
                nickname: item.author.nickname,
                role: item.author.role,
                avatar: item.author.avatar,
              }
            : null,
          updater: item.updater
            ? {
                id: item.updater._id.toString(),
                nickname: item.updater.nickname,
                role: item.updater.role,
              }
            : null,
        });
      }
      return result;
    };

    // .populate("author", "nickname role")：关联查询作者信息，只返回 nickname 和 role 字段
    const [list, total] = await Promise.all([
      ContentModel.find(query)
        .populate("author", "nickname role avatar")
        .populate("updater", "nickname role avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      ContentModel.countDocuments(query),
    ]);

    return { list: formatList(list), total };
  }

  static async getContentDetail(id: string) {
    await connectDB();

    if (!id) {
      throw new Error("文章ID不能为空");
    }

    const result = await ContentModel.findById(id)
      .populate("author", "nickname role avatar")
      .populate("updater", "nickname role avatar")
      .lean();

    return {
      ...result,
      id: result._id.toString(),
      _id: undefined,
      createdAt: result.createdAt?.toLocaleString("zh-CN"),
      updatedAt: result.updatedAt?.toLocaleString("zh-CN"),
      author: result.author
        ? {
            id: result.author._id.toString(),
            nickname: result.author.nickname,
            role: result.author.role,
            avatar: result.author.avatar,
          }
        : null,
      updater: result.updater
        ? {
            id: result.updater._id.toString(),
            nickname: result.updater.nickname,
            role: result.updater.role,
            avatar: result.updater.avatar,
          }
        : null,
    };
  }
}
