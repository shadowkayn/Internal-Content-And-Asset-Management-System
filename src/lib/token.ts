// 目前最流行的 jsonwebtoken (npm) 库是专门为 Node.js 设计的，无法在 Edge 环境运行。
// 应该改用 jose，它是目前 Next.js 社区公认的兼容 Edge Runtime 的加密库。
// import jwt from "jsonwebtoken";
import { jwtVerify, SignJWT } from "jose";
import { JWT_SECRET } from "@/lib/common";

export async function signToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (e) {
    return null;
  }
}
