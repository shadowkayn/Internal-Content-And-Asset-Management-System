"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  message,
  Row,
  Col,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  loginAction,
  registerAction,
  sendEmailVerificationCodeAction,
  checkEmailExistsAction,
} from "@/actions/auth.actions";
import { motion } from "framer-motion";
import AnimeBackground from "@/app/auth/login/cpmponents/AuroraBackground";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  // 获取表单实例
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  // 倒计时
  const [countdown, setCountdown] = useState(0);
  const captchaRef = useRef<HTMLImageElement>(null);
  const [emailChecking, setEmailChecking] = useState(false);

  // 倒计时逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    // 返回一个清理函数，用于在组件卸载时清除定时器
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendEmailCode = async () => {
    try {
      // 校验邮箱格式
      const email = await registerForm.validateFields(["email"]);

      setLoading(true);

      // 先检查邮箱是否已存在
      const checkResult = await checkEmailExistsAction(email.email);
      if (checkResult.error) {
        message.error(checkResult.error);
        return;
      }

      if (checkResult.exists) {
        message.error("该邮箱已被注册，请使用其他邮箱");
        return;
      }

      // 邮箱未被注册，发送验证码
      const result = await sendEmailVerificationCodeAction(email.email);

      if (result.success) {
        message.success("验证码已发送至您的邮箱！");
        setCountdown(60);
      } else {
        message.error(result.error);
      }
    } catch (e) {
      message.error("发送验证码失败");
    } finally {
      setLoading(false);
    }
  };

  // 邮箱输入框失去焦点时检查邮箱是否已存在
  const handleEmailBlur = async () => {
    try {
      const email = registerForm.getFieldValue("email");
      // 只有邮箱格式正确时才检查
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return;
      }

      setEmailChecking(true);
      const checkResult = await checkEmailExistsAction(email);

      if (checkResult.error) {
        return;
      }

      if (checkResult.exists) {
        registerForm.setFields([
          {
            name: "email",
            errors: ["该邮箱已被注册"],
          },
        ]);
      }
    } catch (e) {
      // 静默失败，不影响用户体验
    } finally {
      setEmailChecking(false);
    }
  };

  const refreshCaptcha = () => {
    if (captchaRef.current) {
      captchaRef.current.src = "/api/captcha?" + Date.now();
    }
    loginForm.resetFields(["captcha"]);
  };

  function loginFn(values: any) {
    const { remember, ...loginValues } = values;
    const formData = new FormData();
    Object.keys(loginValues).forEach((key) => {
      formData.append(key, loginValues[key]);
    });

    // 添加记住我选项到表单数据
    formData.append("remember", remember ? "true" : "false");

    setBtnLoading(true);

    loginAction(formData)
      .then((res: any) => {
        if (res.success) {
          message.success("登录成功");
          loginForm.resetFields();
          router.replace("/admin/dashboard");
        } else {
          message.error(res.error || "登录失败");
          // 自动刷新验证码
          refreshCaptcha();
        }
      })
      .catch((err) => {
        message.error(err?.message || "登录失败");
        refreshCaptcha();
      })
      .finally(() => {
        setBtnLoading(false);
      });
  }

  function registerFn(values: any) {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });
    setBtnLoading(true);
    registerAction(formData)
      .then((res: any) => {
        if (res.success) {
          message.success("注册成功");
          // 清空表单，跳转登录tab
          registerForm.resetFields();
          setActiveTab("login");
        } else {
          message.error(res.error);
        }
      })
      .catch((err) => {
        message.error(err.message);
      })
      .finally(() => {
        setBtnLoading(false);
      });
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <AnimeBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ zIndex: 1 }}
      >
        <Card style={styles.card} variant={"outlined"}>
          <div style={styles.header}>
            <h2 style={styles.title}>
              KAYN <span style={styles.titleAccent}>ADMIN</span>
            </h2>
            <p style={styles.subtitle}>欢迎使用沉浸式管理系统</p>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: "login",
                label: "账号登录",
                children: (
                  <Form
                    form={loginForm}
                    onFinish={loginFn}
                    layout="vertical"
                    size="large"
                  >
                    <Form.Item
                      name="username"
                      rules={[
                        { required: true, message: "请输入用户名或邮箱" },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="用户名 / 邮箱"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: "请输入密码" }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="密码"
                      />
                    </Form.Item>

                    <Form.Item
                      name="captcha"
                      rules={[{ required: true, message: "请输入验证码" }]}
                    >
                      <div style={styles.captchaRow}>
                        <Input
                          placeholder="验证码"
                          prefix={<SafetyCertificateOutlined />}
                        />
                        <img
                          ref={captchaRef}
                          src="/api/captcha"
                          alt="captcha"
                          style={styles.captchaImg}
                          onClick={(e) =>
                            (e.currentTarget.src = "/api/captcha?" + Date.now())
                          }
                        />
                      </div>
                    </Form.Item>

                    <div style={styles.rememberRow}>
                      <Form.Item
                        name="remember"
                        valuePropName="checked"
                        noStyle
                      >
                        <Checkbox>Remember</Checkbox>
                      </Form.Item>
                    </div>

                    <Button
                      loading={btnLoading}
                      type="primary"
                      htmlType="submit"
                      block
                      style={styles.submitBtn}
                    >
                      立即登录
                    </Button>
                  </Form>
                ),
              },
              {
                key: "register",
                label: "新用户注册",
                children: (
                  <Form
                    form={registerForm}
                    onFinish={registerFn}
                    layout="vertical"
                    size="large"
                  >
                    <Form.Item
                      name="username"
                      rules={[{ required: true, message: "请设置用户名" }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: "请输入邮箱" },
                        { type: "email", message: "邮箱格式不正确" },
                      ]}
                      validateStatus={emailChecking ? "validating" : undefined}
                      hasFeedback
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="绑定邮箱地址"
                        onBlur={handleEmailBlur}
                      />
                    </Form.Item>

                    <Form.Item required>
                      <Row gutter={8}>
                        <Col span={14}>
                          <Form.Item
                            name="code"
                            noStyle
                            rules={[
                              { required: true, message: "请输入验证码" },
                            ]}
                          >
                            <Input
                              prefix={<SafetyCertificateOutlined />}
                              placeholder="验证码"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Button
                            disabled={countdown > 0}
                            loading={loading}
                            onClick={sendEmailCode}
                            type={"primary"}
                            ghost
                          >
                            {countdown > 0
                              ? `${countdown}s 后重试`
                              : "获取验证码"}
                          </Button>
                        </Col>
                      </Row>
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: "请设置密码" }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="设置密码"
                      />
                    </Form.Item>

                    <Button
                      loading={btnLoading}
                      type="primary"
                      htmlType="submit"
                      block
                      style={styles.submitBtn}
                    >
                      注 册
                    </Button>
                  </Form>
                ),
              },
            ]}
          ></Tabs>
        </Card>
      </motion.div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    width: 420,
    borderRadius: 32,
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(25px) saturate(160%)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    boxShadow: "0 40px 100px -20px rgba(0,0,0,0.3)",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "2px",
    color: "#1a1a1a",
    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  subtitle: {
    color: "#a855f7",
    marginTop: 8,
  },
  captchaRow: {
    display: "flex",
    gap: 8,
  },
  captchaImg: {
    height: 40,
    borderRadius: 4,
    cursor: "pointer",
    border: "1px solid #d9d9d9",
  },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 600,
    marginTop: 12,
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    border: "none",
    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.2)",
  },
  rememberRow: {
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
  },
};
