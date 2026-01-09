import { Schema, models, model } from "mongoose";

const ContentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    // 关联用户
    // 这段代码定义了 Content 模型中的 author 字段，具体解释如下：
    // 字段类型：使用 Schema.Types.ObjectId 类型，这是 MongoDB 中用来表示文档引用的标准类型
    // 引用关系：通过 ref: "User" 指定该字段引用 User 模型，建立内容与用户之间的关联关系
    // 必需字段：required: true 表示每篇内容必须有关联的作者
    // 数据关系：这种设计实现了内容管理系统中"用户-内容"的一对多关系，即一个用户可以创建多篇内容
    // 当查询内容时，可以通过 populate 方法将 author 字段展开为完整的用户信息。
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updater: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deleteFlag: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default models.Content || model("Content", ContentSchema);
