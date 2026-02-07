import { connectDB } from "@/lib/db";
import ContentModel from "@/models/content.model";
import ReviewRecordModel from "@/models/review-record.model";
import { userStorage } from "@/lib/context";
import { Audit } from "@/lib/decorators";
import mongoose from "mongoose";
import {
  PermissionError,
  ValidationError,
  StateError,
  NotFoundError,
  ConflictError,
  TransactionError,
} from "@/lib/errors";

export class ContentService {
  @Audit("内容管理", "CREATE", "创建文章")
  static async createContent(data: any) {
    const store: any = userStorage.getStore();
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

    // 根据用户权限设置文章状态
    // 如果有 content:publish 权限，可以直接发布
    // 否则强制设置为 pending 待审核
    const userPermissions = store?.permissions || [];
    const canPublish = userPermissions.includes("content:publish");

    const finalStatus = canPublish ? data.status || "draft" : "pending";

    const finalData = {
      ...data,
      status: finalStatus,
      author: currentUserId,
      reviewStatus: "not_reviewed",
    };

    return await ContentModel.create(finalData);
  }

  @Audit("内容管理", "UPDATE", "更新文章")
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

  @Audit("内容管理", "DELETE", "删除文章")
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

    const store: any = userStorage.getStore() || {};
    const { userId, permissions = [] } = store;

    const { title, status, category, page = 1, pageSize = 10 } = params;

    const andConditions: any = [{ deleteFlag: 0 }];

    // 权限检查：基于权限而非角色
    const canViewAll = permissions.includes("content:viewAll");
    const canViewPublished = permissions.includes("content:viewPublished");

    if (canViewAll) {
      // 全量数据
      // 如果前端传了 status（比如管理员在下拉框选了“已归档”），那就查对应的状态
      if (status) {
        andConditions.push({ status });
      } else {
        // 如果前端没传 status（默认进页面），帮管理员隐藏归档，让他看“有用的”东西
        andConditions.push({ status: { $ne: "archived" } });
      }
    } else if (canViewPublished) {
      // 有 viewPublished 权限：可以看自己的所有文章 + 别人已发布的
      if (status) {
        // 如果选了状态：看自己该状态的文章 OR 别人该状态且已发布的文章
        andConditions.push({
          $or: [
            { author: userId, status },
            { author: { $ne: userId }, status: "published" },
          ],
        });
      } else {
        // 默认情况：看自己所有的 + 别人发布的
        andConditions.push({
          $or: [{ author: userId }, { status: "published" }],
        });
      }
    } else {
      // 无特殊权限：只能看已发布的文章
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

  /**
   * 审核文章
   * @param params 审核参数
   */
  @Audit("内容管理", "UPDATE", "审核文章")
  static async reviewContent(params: {
    contentId: string;
    action: "approved" | "rejected";
    reason?: string;
  }): Promise<void> {
    const store: any = userStorage.getStore();
    const currentUserId = store?.userId;

    if (!currentUserId) {
      throw new PermissionError("用户未登录");
    }

    // 权限检查：需要 content:review 权限
    const userPermissions = store?.permissions || [];
    if (!userPermissions.includes("content:review")) {
      throw new PermissionError("无权限执行审核操作");
    }

    // 验证驳回时必须填写原因
    if (params.action === "rejected" && !params.reason?.trim()) {
      throw new ValidationError("驳回时必须填写驳回原因");
    }

    await connectDB();

    const content = await ContentModel.findById(params.contentId);
    if (!content) {
      throw new NotFoundError("文章不存在");
    }

    // 状态检查：只能审核待审核状态的文章
    if (content.status !== "pending") {
      throw new StateError(
        `只能审核待审核状态的文章，当前状态：${content.status}`,
      );
    }

    // 使用事务确保原子性
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 更新文章状态
      const newStatus = params.action === "approved" ? "published" : "draft";
      const reviewStatus =
        params.action === "approved" ? "approved" : "rejected";

      await ContentModel.findByIdAndUpdate(
        params.contentId,
        {
          status: newStatus,
          reviewStatus: reviewStatus,
          lastReviewedBy: currentUserId,
          lastReviewedAt: new Date(),
          rejectionReason: params.reason || "",
        },
        { session },
      );

      // 创建审核记录
      await ReviewRecordModel.create(
        [
          {
            contentId: params.contentId,
            reviewerId: currentUserId,
            action: params.action,
            reason: params.reason || "",
            previousStatus: content.status,
            newStatus: newStatus,
          },
        ],
        { session },
      );

      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();

      // 区分不同类型的错误
      if (error.code === 11000) {
        throw new ConflictError("文章正在被其他管理员审核");
      }

      throw new TransactionError("审核操作失败，请重试");
    } finally {
      await session.endSession();
    }
  }

  /**
   * 提交文章审核
   * @param contentId 文章ID
   */
  @Audit("内容管理", "UPDATE", "提交文章审核")
  static async submitForReview(contentId: string): Promise<void> {
    const store: any = userStorage.getStore();
    const currentUserId = store?.userId;
    const userPermissions = store?.permissions || [];

    if (!currentUserId) {
      throw new PermissionError("用户未登录");
    }

    await connectDB();

    const content = await ContentModel.findById(contentId);
    if (!content) {
      throw new NotFoundError("文章不存在");
    }

    // 权限检查：只能提交自己的文章（除非有 content:submit 权限可以提交所有文章）
    const canSubmitAll = userPermissions.includes("content:submitAll");
    if (content.author.toString() !== currentUserId && !canSubmitAll) {
      throw new PermissionError("只能提交自己的文章");
    }

    // 状态检查：只能提交草稿状态的文章
    if (content.status !== "draft") {
      throw new StateError(
        `只能提交草稿状态的文章，当前状态：${content.status}`,
      );
    }

    await ContentModel.findByIdAndUpdate(contentId, {
      status: "pending",
      reviewStatus: "not_reviewed",
    });
  }
}
