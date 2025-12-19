import bcrypt from "bcryptjs";

const SALT_ROUNDS = 15;

// 加密
export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// 解密验证
export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  return bcrypt.compare(password, hashedPassword);
}
