"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Timeline,
  Tag,
  Space,
  Avatar,
  Button,
  message,
  Skeleton,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  EyeOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  BellOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  getArticlesOfSevenDaysAction,
  getArticlesTypesAction,
  getStatisticsAction,
} from "@/actions/dashboard.action";
import { getLogListAction } from "@/actions/log.action";

const { Title, Text } = Typography;

// 动态导入图表组件，防止 SSR 报错
const Area = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Area),
  { ssr: false },
);
const Pie = dynamic(() => import("@ant-design/charts").then((mod) => mod.Pie), {
  ssr: false,
});

export default function DashboardPage() {
  const router = useRouter();
  const userInfo = useCurrentUser();
  const [statistics, setStatistics] = useState<any>({});
  const [articles, setArticles] = useState<any>([]);
  const [articlesTypes, setArticlesTypes] = useState<any>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const [res1, res2, res3, res4] = await Promise.allSettled([
        getStatisticsAction(),
        getArticlesOfSevenDaysAction(),
        getArticlesTypesAction(),
        getLogListAction({ page: 1, pageSize: 5 }),
      ]);
      if (res1.status === "fulfilled" && res1.value.success) {
        setStatistics(res1.value.data);
      }
      if (res2.status === "fulfilled" && res2.value.success) {
        setArticles(res2.value.data);
      }
      if (res3.status === "fulfilled" && res3.value.success) {
        setArticlesTypes(res3.value.data);
      }
      if (res4.status === "fulfilled" && res4.value.success) {
        setLogs(res4.value.data?.list || []);
      }
    } catch (e: any) {
      message.error(e.message || "查询失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getStatistics().then();
  }, [getStatistics]);

  const areaChartConfig = useMemo(() => {
    const maxVal = Math.max(...articles.map((d: any) => d.count), 0);

    return {
      data: articles,
      xField: "date",
      yField: "count",

      paddingRight: 40,
      paddingBottom: 20,
      paddingLeft: 40,

      scale: {
        y: {
          min: 0,
          tickCount: maxVal < 2 ? 1 : null,
          nice: false,
        },
      },

      axis: {
        x: {
          labelAutoRotate: false,
          labelAutoHide: true,
        },
        y: {
          min: 0,
          labelFormatter: (val: number) => Math.floor(val),
        },
      },

      smooth: false,
      style: {
        fill: "linear-gradient(-90deg, white 0%, #818cf8 100%)",
        fillOpacity: 0.5,
        stroke: "#818cf8",
        lineWidth: 2,
      },

      // 点的配置
      point: {
        shapeField: "circle",
        sizeField: 4,
        style: {
          fill: "white",
          stroke: "#818cf8",
          lineWidth: 2,
        },
      },

      tooltip: {
        items: [{ channel: "y", name: "文章数量" }],
        display: "multi",
        showMarkers: true,
      },
    };
  }, [articles]);

  const pieChartConfig = useMemo(() => {
    return {
      data: articlesTypes,
      angleField: "value",
      colorField: "type",
      coordinate: { type: "theta", innerRadius: 0.6, outerRadius: 0.8 },

      label: {
        text: (d: any) => `${d.type}: ${d.value}`,
        position: "outside",
        style: {
          fontWeight: "bold",
        },
      },
      legend: {
        color: {
          position: "bottom",
          layout: { justifyContent: "center" },
        },
      },
      tooltip: {
        title: (item: any) => item.type,
        items: [
          (data: any) => ({
            name: "数量",
            value: `${data.value} 篇`,
            color: data.color,
          }),
        ],
      },
    };
  }, [articlesTypes]);

  const cardStyle = {
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    boxShadow: "0 10px 30px rgba(147, 197, 253, 0.1)",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
  };

  return loading ? (
    <>
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
    </>
  ) : (
    <div style={{ padding: "8px" }}>
      <div style={{ marginBottom: 32 }}>
        <Title
          level={2}
          style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}
        >
          系统概览 <RiseOutlined style={{ color: "#6366f1", fontSize: 24 }} />
        </Title>
        <Text type="secondary">
          欢迎回来，{userInfo?.nickname}。这是您今日的内容运营看板。
        </Text>
      </div>

      {/* 第一层：数据指标卡 */}
      <Row gutter={[24, 24]}>
        {[
          {
            title: "内容总量",
            value: 0,
            key: "contentCount",
            icon: <FileTextOutlined />,
            color: "#818cf8",
            bg: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
          },
          {
            title: "活跃用户",
            value: 0,
            key: "userCount",
            icon: <UserOutlined />,
            color: "#c084fc",
            bg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
          },
          {
            title: "今日访问",
            value: 0,
            key: "visitCount",
            icon: <EyeOutlined />,
            color: "#fb7185",
            bg: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
          },
          {
            title: "待办事项",
            value: 0,
            key: "todoCount",
            icon: <BellOutlined />,
            color: "#fbbf24",
            bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          },
        ].map((item, index) => (
          <Col xs={24} sm={12} xl={6} key={index}>
            <Card style={cardStyle} hoverable>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 14, fontWeight: 500 }}
                  >
                    {item.title}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: "#1e293b",
                      }}
                    >
                      {statistics[item.key]?.toLocaleString() || item.value}
                    </span>
                    <Tag
                      color="green"
                      variant="solid"
                      style={{ marginLeft: 8, borderRadius: "6px" }}
                    >
                      <ArrowUpOutlined /> {8}%
                    </Tag>
                  </div>
                </div>
                <Avatar
                  size={48}
                  icon={item.icon}
                  style={{
                    background: item.bg,
                    color: item.color,
                    border: "none",
                  }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 第二层：趋势分析图 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Text strong style={{ fontSize: 18 }}>
                内容增长趋势 (近7日)
              </Text>
            }
            style={cardStyle}
          >
            <div style={{ height: 350 }}>
              <Area {...areaChartConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 第三层：分布与活动 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <Text strong style={{ fontSize: 18 }}>
                内容分类占比
              </Text>
            }
            style={cardStyle}
          >
            <div style={{ height: 300 }}>
              <Pie {...pieChartConfig} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={
              <Text strong style={{ fontSize: 18 }}>
                最近动态
              </Text>
            }
            style={cardStyle}
            extra={
              <Button
                type="link"
                onClick={() => router.push("/admin/system/logs")}
              >
                查看全部
              </Button>
            }
          >
            <div style={{ padding: "10px 0" }}>
              {logs.length > 0 ? (
                <Timeline
                  items={logs.map((log) => {
                    const getColor = (status: string) => {
                      return status === "success" ? "green" : "red";
                    };

                    return {
                      color: getColor(log.status),
                      content: (
                        <Space orientation="vertical" size={0}>
                          <Text strong>
                            {log.operator} {log.description}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {log.createdAt} · {log.module}
                          </Text>
                        </Space>
                      ),
                    };
                  })}
                />
              ) : (
                <Text type="secondary">暂无最新动态</Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .ant-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(147, 197, 253, 0.2) !important;
        }
        /* 调整时间轴文字间距 */
        .ant-timeline-item-content {
          margin-bottom: 20px !important;
        }
      `}</style>
    </div>
  );
}
