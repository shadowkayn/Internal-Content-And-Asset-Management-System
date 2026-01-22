"use client";

import React, { useEffect, useState } from "react";
import { Button, Typography, Space, Row, Col, Card, Badge } from "antd";
import {
  RocketOutlined,
  SafetyCertificateOutlined,
  PieChartOutlined,
  ArrowRightOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f5f7ff 0%, #fff1f2 50%, #f0fdf4 100%)",
        }}
      />
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f5f7ff 0%, #fff1f2 50%, #f0fdf4 100%)",
        padding: "20px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "40vw",
          height: "40vw",
          background: "rgba(165, 180, 252, 0.2)",
          filter: "blur(100px)",
          borderRadius: "50%",
          top: "-10%",
          left: "-10%",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "48px",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 40px 100px rgba(147, 197, 253, 0.1)",
          padding: "80px 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Row align="middle" gutter={[40, 40]}>
          <Col xs={24} lg={12}>
            <Space orientation="vertical" size={32}>
              <Badge
                count="Next.js 16 + MongoDB"
                style={{
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  color: "#6366f1",
                  boxShadow: "none",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  fontWeight: 600,
                  padding: "0 12px",
                }}
              />

              <div className="hero-text">
                <Title
                  style={{
                    fontSize: "56px",
                    fontWeight: 900,
                    marginBottom: 16,
                    letterSpacing: "-2px",
                  }}
                >
                  KAYN{" "}
                  <span
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ADMIN
                  </span>
                </Title>
                <Title
                  level={2}
                  style={{
                    marginTop: 0,
                    color: "#475569",
                    fontWeight: 500,
                    fontSize: "24px",
                  }}
                >
                  全栈式企业级内容管理系统
                </Title>
                <Paragraph
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    maxWidth: "480px",
                    lineHeight: 1.8,
                  }}
                >
                  基于现代技术栈打造的沉浸式后台方案。集成了精细化的 RBAC
                  权限体系、流式内容预览以及高度可配置的系统字典。不仅是工具，更是美学。
                </Paragraph>
              </div>

              <Space size="middle">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => router.push("/auth/login")}
                  style={{
                    height: "56px",
                    padding: "0 32px",
                    borderRadius: "16px",
                    fontSize: "16px",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                    border: "none",
                    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  立即进入系统
                </Button>
                <Button
                  size="large"
                  icon={<GithubOutlined />}
                  style={{
                    height: "56px",
                    padding: "0 24px",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                  }}
                  onClick={() =>
                    window.open(
                      "https://github.com/shadowkayn/Internal-Content-And-Asset-Management-System",
                    )
                  }
                >
                  项目源码
                </Button>
              </Space>
            </Space>
          </Col>

          <Col xs={24} lg={12}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <FeatureCard
                  icon={
                    <SafetyCertificateOutlined style={{ color: "#818cf8" }} />
                  }
                  title="RBAC 权限体系"
                  desc="基于角色和权限点的全动态访问控制，精确到按钮级别。"
                />
              </Col>
              <Col span={12}>
                <FeatureCard
                  icon={<PieChartOutlined style={{ color: "#fb7185" }} />}
                  title="数据可视化"
                  desc="实时洞察内容趋势。"
                />
              </Col>
              <Col span={12}>
                <FeatureCard
                  icon={<RocketOutlined style={{ color: "#fbbf24" }} />}
                  title="极速响应"
                  desc="SSR 与 ISR 深度优化。"
                />
              </Col>
            </Row>
          </Col>
        </Row>

        <div
          style={{
            marginTop: 80,
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.5)",
            paddingTop: 40,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12, letterSpacing: 2 }}>
            DESIGNED BY KAYN © 2026 · NEXT.JS FULLSTACK PRACTICE
          </Text>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .hero-text {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <Card
      style={{
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        background: "rgba(255, 255, 255, 0.5)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
      }}
    >
      <Space orientation="vertical">
        <div style={{ fontSize: "24px", marginBottom: 8 }}>{icon}</div>
        <Text strong style={{ fontSize: "16px", color: "#1e293b" }}>
          {title}
        </Text>
        <Text type="secondary" style={{ fontSize: "13px" }}>
          {desc}
        </Text>
      </Space>
    </Card>
  );
}
