"use server";

import { AuthServer } from "@/service/auth.server";

// 获取邮箱验证码
export async function sendEmailVerificationCodeAction(email: string) {
  try {
    await AuthServer.sendEmailVerificationCode(email);
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "邮箱验证码发送失败" };
  }
}

//  loginFunc
export async function loginAction(formData: FormData) {
  try {
    return await AuthServer.login(formData);
  } catch (e) {
    console.error("Login Error:", e);
    return { error: "系统登录异常，请稍后再试" };
  }
}

// logoutFunc
export async function logoutAction() {
  try {
    await AuthServer.logout();
    return { success: true };
  } catch (e) {
    return { error: "系统登出异常，请稍后再试" };
  }
}

// signupFunc
export async function registerAction(formData: FormData) {
  try {
    const result = await AuthServer.register(formData);
    return result || { success: true };
  } catch (e) {
    return { error: "注册失败" };
  }
}
