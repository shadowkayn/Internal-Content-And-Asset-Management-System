import { Resend } from "resend";
import { redis } from "@/lib/redis";
import { Audit } from "@/lib/decorators";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import User from "@/models/user.model";
import { comparePassword, hashPassword } from "@/lib/password";
import PermissionModel from "@/models/permission.model";
import { signToken } from "@/lib/token";
import { validateEmail } from "@/lib/common";

const isProduction = process.env.NODE_ENV === "production";

// 实现“绑定邮箱”的验证功能，目前在 Next.js 中最优雅的方案是结合 Server Actions 和 Resend（一个对开发者极其友好的邮件服务）。
// 安装 Resend：pnpm install resend

const resend = new Resend(process.env.RESEND_API_KEY);

export class AuthServer {
  @Audit("用户认证", "发送邮箱验证码", "发送邮箱验证码")
  static async sendEmailVerificationCode(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存入 Redis ---
    // key: email_code:user@example.com
    // ex: 300 表示 300 秒（5分钟）后自动消失
    await redis.set(`email_code:${email}`, code, { ex: 300 });

    // 发送邮箱验证码
    await resend.emails.send({
      from: "Verify <onboarding@resend.dev>",
      to: [email],
      subject: "Your registration verification code",
      html: `<h1>Your verification code is：${code}</h1><p>The code is valid for 5 minutes</p>`,
    });
  }

  @Audit("用户认证", "登录", "用户登录")
  static async login(formData: FormData) {
    await connectDB();
    const cookieStore = await cookies();

    const identifier = formData.get("username") as string; // 可以是用户名或邮箱
    const password = formData.get("password") as string;
    const inputCaptcha = formData.get("captcha")?.toString().toLowerCase();
    const remember = formData.get("remember") === "true";

    // 从 Redis 获取答案
    const captchaId = cookieStore.get("captcha_id")?.value;
    if (!captchaId) {
      return { error: "验证码已过期，请刷新图片" };
    }
    const serverCode = await redis.get(`captcha:${captchaId}`);

    // 验证后立即删除 (确保验证码只能使用一次)
    if (serverCode) {
      await redis.del(`captcha:${captchaId}`);
    }

    if (!identifier || !password) {
      return { error: "用户名或密码不能为空" };
    }

    if (!serverCode || serverCode !== inputCaptcha) {
      return { success: false, error: "验证码输入错误" };
    }

    const query = identifier.includes("@")
      ? { email: identifier }
      : { username: identifier };

    const user = await User.findOne(query).lean();

    if (!user) {
      return { error: "用户不存在" };
    }

    if (user.status !== "active") {
      return { error: "用户被禁用" };
    }

    if (user.roleStatus !== "active") {
      return { error: "用户绑定角色被禁用" };
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return { error: "密码错误" };
    }

    const permissions = await PermissionModel.find({
      code: { $in: user.permissions },
      deleteFlag: 0,
      type: "menu",
    });

    // ['/admin/dashboard', '/admin/contents/list', '/admin/contents/preview']
    const allowedPaths = permissions.map((p) => p.path);

    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      allowedPaths,
    });

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: isProduction, // 只在 HTTPS 连接中传输 cookie
      sameSite: "strict",
      maxAge: remember ? 3 * 24 * 60 * 60 : 6 * 60 * 60, // 3天或6h
    });
  }

  @Audit("用户认证", "登出", "用户登出")
  static async logout() {
    (await cookies()).set("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      expires: new Date(0),
      maxAge: 0,
    });
  }

  @Audit("用户认证", "注册", "用户注册")
  static async register(formData: FormData) {
    await connectDB();

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const inputCaptcha = formData.get("code");

    if (!username || !password || !email) {
      return { error: "用户名、密码和邮箱不能为空" };
    }

    if (password.length < 6) {
      return { error: "密码长度不能小于6位" };
    }

    if (!validateEmail(email)) {
      return { error: "邮箱格式不正确" };
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return { error: "用户名或邮箱已存在" };
    }

    // 从 Redis 中获取验证码
    const saveCode = await redis.get(`email_code:${email}`);
    if (!saveCode || saveCode.toString() !== inputCaptcha) {
      return { error: "验证码错误或已过期" };
    }
    // 创建新用户
    const newUser = await User.create({
      username,
      password: await hashPassword(password),
      email,
      role: "viewer",
      status: "active",
    });

    const token = await signToken({
      userId: newUser._id.toString(),
      role: newUser.role,
      permissions: newUser.permissions,
    });

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    });
  }
}
