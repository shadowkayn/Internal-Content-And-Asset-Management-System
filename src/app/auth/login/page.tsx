"use client";

import React, { useEffect, useState } from "react";
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
  login,
  register,
  sendEmailVerificationCode,
} from "@/actions/auth.actions";

export default function AuthPage() {
  // 获取表单实例
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  // 倒计时
  const [countdown, setCountdown] = useState(0);

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
      const result = await sendEmailVerificationCode(email.email);

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

  function loginFn(values: any) {
    const { remember, ...loginValues } = values;
    const formData = new FormData();
    Object.keys(loginValues).forEach((key) => {
      formData.append(key, loginValues[key]);
    });

    // 添加记住我选项到表单数据
    formData.append("remember", remember ? "true" : "false");

    setBtnLoading(true);

    login(formData)
      .then((res) => {
        if (res.success) {
          message.success("登录成功");
          loginForm.resetFields();
          window.location.href = "/admin/dashboard";
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

  function registerFn(values: any) {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });
    setBtnLoading(true);
    register(formData)
      .then((res) => {
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
    <div style={styles.container}>
      {/* 背景装饰 */}
      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>

      <Card style={styles.card} variant={"outlined"}>
        <div style={styles.header}>
          <h2 style={styles.title}>ADMIN SYSTEM</h2>
          <p style={styles.subtitle}>欢迎使用后台管理系统</p>
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
                    rules={[{ required: true, message: "请输入用户名或邮箱" }]}
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
                    <Form.Item name="remember" valuePropName="checked" noStyle>
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
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="绑定邮箱地址"
                    />
                  </Form.Item>

                  <Form.Item required>
                    <Row gutter={8}>
                      <Col span={14}>
                        <Form.Item
                          name="code"
                          noStyle
                          rules={[{ required: true, message: "请输入验证码" }]}
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
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    position: "relative",
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "50%",
    top: "-100px",
    right: "-100px",
    opacity: 0.1,
  },
  bgCircle2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "#1890ff",
    borderRadius: "50%",
    bottom: "-50px",
    left: "-50px",
    opacity: 0.1,
  },
  card: {
    width: 400,
    borderRadius: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
    background: "rgba(255, 255, 255, 0.9)",
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
  },
  subtitle: {
    color: "#8c8c8c",
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
    height: 45,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    marginTop: 12,
  },
  rememberRow: {
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
  },
};
