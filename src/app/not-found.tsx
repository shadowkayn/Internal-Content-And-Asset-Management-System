"use client";

import React from "react";
import { Button, Result, Typography } from "antd";
import { useRouter } from "next/navigation";

const { Text } = Typography;

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f5f7ff 0%, #fff1f2 50%, #f0fdf4 100%)",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          padding: "48px",
          borderRadius: "40px",
          boxShadow: "0 30px 60px rgba(147, 197, 253, 0.2)",
          border: "1px solid rgba(255, 255, 255, 1)",
          backdropFilter: "blur(20px)",
          textAlign: "center",
          maxWidth: 500,
        }}
      >
        <Result
          status="404"
          title={
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                backgroundImage:
                  "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              404
            </span>
          }
          subTitle={
            <Text type="secondary" style={{ fontSize: 16 }}>
              哎呀！您访问的页面好像飘到外太空去了...
            </Text>
          }
          extra={
            <Button
              type="primary"
              size="large"
              onClick={() => router.push("/")}
              style={{
                borderRadius: "12px",
                height: "45px",
                padding: "0 32px",
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                border: "none",
              }}
            >
              返回首页
            </Button>
          }
        />
      </div>
    </div>
  );
}
