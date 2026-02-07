"use client";

import React from "react";
import { Button, Result, Typography } from "antd";
import { useRouter } from "next/navigation";
import { LockOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100%", // 如果在 AdminLayout 内部渲染，使用 100%
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px",
        }}
      >
        <Result
          icon={
            <div
              style={{
                fontSize: 80,
                marginBottom: 20,
                filter: "drop-shadow(0 10px 20px rgba(99, 102, 241, 0.2))",
              }}
            >
              <LockOutlined style={{ color: "#818cf8" }} />
            </div>
          }
          status="403"
          title={
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#1e293b",
              }}
            >
              禁止访问
            </span>
          }
          subTitle={
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 16 }}>
                抱歉，您的账号等级似乎不足以开启这道传送门。
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 14, opacity: 0.7 }}>
                如有疑问，请联系系统管理员申请权限。
              </Text>
            </div>
          }
          extra={
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                onClick={() => router.push("/admin/dashboard")}
                style={{
                  borderRadius: "12px",
                  padding: "0 32px",
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                  border: "none",
                }}
              >
                回到控制台
              </Button>
              <Button
                type="link"
                size="large"
                onClick={() => router.push("/auth/login")}
                style={{ marginLeft: 16, color: "#6366f1" }}
              >
                返回上一页
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
