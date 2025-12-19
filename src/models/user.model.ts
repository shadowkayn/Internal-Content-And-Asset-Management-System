import mongoose, { models } from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  age: {
    type: Number,
    default: 18,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  // 软删除
  isDeleted: {
    type: Boolean,
  },
});

// models.User || ... 是为了解决 Next.js 热更新重复注册模型的问题
const UserModel = models.User || mongoose.model("User", UserSchema);

export default UserModel;
