import svgCaptcha from "svg-captcha";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis"; // 之前配置的 redis 客户端
import { v4 as uuidv4 } from "uuid";
import { error } from "@/lib/response"; // pnpm install uuid

// 生成一个唯一的 captchaId 作为 Redis 的键
// 并将它通过 Cookie 传给前端（注意：Cookie 里只存 ID，不存答案）

export async function GET() {
  try {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: "0o1i",
      noise: 2,
      color: true,
      background: "#f0f0f0",
    });

    // 生成唯一标识符
    const captchaId = uuidv4();

    // 存入 Redis，设置 2 分钟过期 (120秒)
    // key 加上前缀便于管理，例如 captcha:uuid
    await redis.set(`captcha:${captchaId}`, captcha.text.toLowerCase(), {
      ex: 120,
    });

    // 获取 cookieStore
    const cookieStore = await cookies();

    // 将 captchaId 存入 Cookie
    cookieStore.set("captcha_id", captchaId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 120,
      path: "/", // 确保全局可用
    });

    return new NextResponse(captcha.data, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store, max-age=0", // 禁止浏览器缓存验证码
      },
    });
  } catch (err) {
    console.error("验证码生成失败:", err);
    return error("验证码生成失败", 500);
  }
}
