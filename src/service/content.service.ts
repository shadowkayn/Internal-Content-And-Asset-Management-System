import { connectDB } from "@/lib/db";
import ContentModel from "@/models/content.model";
import { userStorage } from "@/lib/context";

export class ContentService {
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
    } else if (role === "editor") {
      // 编辑者：只能查看自己创建的文章 or 别人已发布的文章
      andConditions.push({
        $or: [{ author: userId }, { status: "published" }],
      });
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
    // 处理外部传入的 status：如果用户选了状态，且这个状态不冲突
    if (status) {
      // 如果是普通用户，他传 status=draft，最终查询会变成 {status: 'published', status: 'draft'}
      // 这会导致结果为空（正确行为），而不是越权查到草稿
      andConditions.push({ status });
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
          createdAt: item.createdAt?.toLocaleString("zh-CN"),
          updatedAt: item.updatedAt?.toLocaleString("zh-CN"),
          // 精确处理子对象
          author: item.author
            ? {
                id: item.author._id.toString(),
                nickname: item.author.nickname,
                role: item.author.role,
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
        .populate("author", "nickname role")
        .populate("updater", "nickname role")
        .skip(skip)
        .limit(pageSize)
        .sort({ createTime: -1 })
        .lean(),
      ContentModel.countDocuments(query),
    ]);

    return { list: formatList(list), total };
  }
}
