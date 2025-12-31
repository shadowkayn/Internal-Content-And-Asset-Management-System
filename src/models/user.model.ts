import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  nickname: string;
  password: string;
  role: "admin" | "editor" | "viewer";
  permissions: [string];
  status: "active" | "disabled";
  email: string;
  avatar: string;
  phone: string;
  deleteFlag: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nickname: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    phone: {
      type: String,
      default: "",
    },
    deleteFlag: {
      type: Number,
      default: 0,
    },
  },
  {
    // Mongoose 会自动给这个集合添加 createdAt、updatedA 两个字段
    timestamps: true,
  },
);

// 防止模型重复连接，Next.js 热更新必备
const User: Model<IUser> =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
