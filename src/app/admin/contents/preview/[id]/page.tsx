"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Tag,
  Space,
  Divider,
  Row,
  Col,
  Card,
  Avatar,
  Descriptions,
  Image,
  Statistic,
  Affix,
  Skeleton, // 引入骨架屏增加高级感
  message,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShareAltOutlined,
  HistoryOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  HeartOutlined,
  UserSwitchOutlined,
  ConsoleSqlOutlined,
} from "@ant-design/icons";
import ArticleModal from "@/app/admin/contents/list/components/ContentModal";

// 假设这是你之前写的 Server Action
import {
  deleteContentAction,
  getContentDetail,
} from "@/actions/content.actions";
import { useDictOptions } from "@/hooks/useDictOptions";

const { Title, Text } = Typography;

export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams(); // 2. 获取动态路由中的 id
  const id = params.id;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);
  const { options: contentCategoryOptions } = useDictOptions(
    "sys_content_category",
  );

  const getArticleCategory = (category: string) => {
    const categoryOption = contentCategoryOptions.find(
      (item: any) => item.value === category,
    );
    return categoryOption?.label || "未知";
  };

  const statusConfig: any = {
    published: {
      color: "#52c41a",
      text: "已发布",
      cover:
        "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop",
      description: "该内容目前对所有用户公开可见",
      statusText: `已发布 (Public)`,
    },
    draft: {
      color: "#faad14",
      text: "草稿",
      cover:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
      description: "该内容仅对登录用户可见",
      statusText: `草稿 (Draft)`,
    },
    archived: {
      color: "#ff4d4f",
      text: "已归档",
      cover:
        "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop",
      description: "该内容已归档，管理员可见",
      statusText: `已归档 (Archived)`,
    },
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getContentDetail(id as string);
      if (res.success) {
        const { cover, status } = res.data || {};
        const result = {
          ...res.data,
          cover: cover || (statusConfig?.[status]?.cover as string),
          statusText: statusConfig?.[status]?.statusText,
          statusDescription: statusConfig?.[status]?.description,
          statusColor: statusConfig?.[status]?.color,
        };
        setArticle(result);
      }
    } catch (error: any) {
      message.error(error.message || "获取详情失败");
      router.push("/admin/contents/preview");
    } finally {
      setLoading(false);
    }
  };

  // 根据 ID 加载数据
  useEffect(() => {
    fetchData();

    if (id) {
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const onBackList = () => {
    router.push("/admin/contents/preview");
  };

  const onUpdateArticle = () => {
    setIsModalOpen(true);
  };

  const onClose = () => {
    setIsModalOpen(false);
  };

  const { confirm } = Modal;

  const onDelete = () => {
    confirm({
      title: "确认删除这篇文章吗?",
      icon: <ExclamationCircleFilled />,
      content: "删除之后文章不可恢复，确认继续？",
      async onOk() {
        const ids = [article.id];
        try {
          setLoading(true);
          const res = await deleteContentAction(ids);
          if (res.success) {
            message.success("删除成功");
            router.push("/admin/contents/preview");
          } else {
            message.error(res.error || "删除失败");
          }
        } catch (e: any) {
          message.error(e.message || "删除失败");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const onSuccessCallback = async () => {
    onClose();
    await fetchData();
  };

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!article) return <div>文章不存在</div>;

  return (
    <div
      style={{
        background: "transparent",
        minHeight: "100vh",
        padding: "0 0 40px 0",
      }}
    >
      <Affix offsetTop={0}>
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            zIndex: 100,
            backdropFilter: "blur(10px)",
          }}
        >
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              type="text"
              onClick={onBackList}
            >
              返回列表
            </Button>
          </Space>
          <Space>
            <Button icon={<ShareAltOutlined />}>分享</Button>
            <Button icon={<DeleteOutlined />} danger onClick={onDelete}>
              删除
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={onUpdateArticle}
            >
              编辑内容
            </Button>
          </Space>
        </div>
      </Affix>
      <div style={{ maxWidth: 1400, margin: "24px auto", padding: "0 24px" }}>
        <Row gutter={24}>
          <Col span={17}>
            <Card
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  margin: "-24px -24px 24px -24px",
                  maxHeight: 400,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={article?.cover}
                  width="100%"
                  preview={false}
                  style={{ objectFit: "cover" }}
                />
              </div>
              <Typography>
                <Title style={{ textAlign: "center" }}>{article.title}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {article?.description || "暂无描述"}
                </Text>

                <Divider />

                <div
                  className="article-content"
                  style={{ fontSize: 16, lineHeight: "1.8", color: "#333" }}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </Typography>
            </Card>
          </Col>

          <Col span={7}>
            <Space orientation={"vertical"} size={24} style={{ width: "100%" }}>
              <Card
                title={
                  <Space size={6}>
                    <LoadingOutlined style={{ color: "#818cf8" }} />
                    <Text strong style={{ color: "#475569" }}>
                      文章状态
                    </Text>
                  </Space>
                }
                styles={{ body: { padding: "20px" } }}
                style={{
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <Tag
                    color={article?.statusColor}
                    style={{
                      fontSize: 14,
                      padding: "4px 16px",
                      borderRadius: 8,
                      border: "none",
                    }}
                  >
                    {article?.statusText}
                  </Tag>
                  <div
                    style={{ marginTop: 12, color: "#94a3b8", fontSize: 12 }}
                  >
                    {article?.statusDescription}
                  </div>
                </div>
              </Card>

              <Card
                title={
                  <Space size={6}>
                    <HeartOutlined style={{ color: "#818cf8" }} />
                    <Text strong style={{ color: "#475569" }}>
                      数据统计
                    </Text>
                  </Space>
                }
                style={{
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title={
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          总阅读量
                        </Text>
                      }
                      value={article?.views || 0}
                      prefix={
                        <EyeOutlined
                          style={{ color: "#818cf8", fontSize: 16 }}
                        />
                      }
                      style={{
                        color: "#1e293b",
                        fontSize: 20,
                        fontWeight: 700,
                      }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title={
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          内容字数
                        </Text>
                      }
                      value={article?.words || 0}
                      style={{
                        color: "#1e293b",
                        fontSize: 20,
                        fontWeight: 700,
                      }}
                    />
                  </Col>
                </Row>
              </Card>

              <Card
                title={
                  <Space size={6}>
                    <UserSwitchOutlined style={{ color: "#818cf8" }} />
                    <Text strong style={{ color: "#475569" }}>
                      作者信息
                    </Text>
                  </Space>
                }
                style={{
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <Space align="start" size={12}>
                  <Avatar
                    size={54}
                    src={
                      article?.author?.avatar ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=Kayn"
                    }
                    style={{ border: "2px solid #f1f5f9" }}
                  />
                  <div style={{ paddingTop: 4 }}>
                    <div
                      style={{
                        fontWeight: "800",
                        fontSize: 16,
                        color: "#1e293b",
                      }}
                    >
                      {article?.author?.nickname}
                    </div>
                    <div
                      style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}
                    >
                      {article?.author?.role || "--"}
                    </div>
                  </div>
                </Space>
              </Card>

              <Card
                title={
                  <Space size={6}>
                    <ConsoleSqlOutlined style={{ color: "#818cf8" }} />
                    <Text strong style={{ color: "#475569" }}>
                      系统参数
                    </Text>
                  </Space>
                }
                size="small"
                style={{
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <Descriptions
                  column={1}
                  size="small"
                  labelStyle={{ color: "#94a3b8" }}
                >
                  <Descriptions.Item label="文档ID">
                    <Text
                      copyable
                      type="secondary"
                      style={{ fontSize: 14, fontFamily: "monospace" }}
                    >
                      {article.id}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {article.createdAt}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="最后更新">
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {article.updatedAt}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>

                <Divider style={{ margin: "16px 0 12px" }} />

                <div
                  style={{
                    marginBottom: 10,
                    fontSize: 12,
                    color: "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  标签云集：
                </div>
                <Space wrap size={[8, 8]}>
                  <Tag
                    style={{
                      background: "#f1f5f9",
                      color: "#64748b",
                      borderRadius: 6,
                      padding: "2px 10px",
                    }}
                  >
                    {getArticleCategory(article.category)}
                  </Tag>
                </Space>
              </Card>

              <Card
                title={
                  <Space size={6}>
                    <HistoryOutlined style={{ color: "#818cf8" }} />
                    <Text strong style={{ color: "#475569" }}>
                      修改日志
                    </Text>
                  </Space>
                }
                size="small"
                style={{
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ padding: "4px 0" }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 12,
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <span style={{ color: "#cbd5e1" }}>●</span>
                    <span>
                      2026-01-08 14:35 管理员修改了文章封面并优化了排版
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <span style={{ color: "#cbd5e1" }}>●</span>
                    <span>
                      2026-01-08 10:00 {article?.author?.nickname}
                      提交了初稿并发布
                    </span>
                  </div>
                </div>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>

      <ArticleModal
        isModalOpen={isModalOpen}
        isEditMode
        editItem={article}
        onClose={onClose}
        onSuccessCallback={onSuccessCallback}
      />

      <style jsx global>{`
        .article-content table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1.5rem 0;
          overflow: hidden;
          border-radius: 8px;
          border: 1px solid #e2e8f0; /* 外边框 */
        }

        .article-content td,
        .article-content th {
          min-width: 1em;
          border: 1px solid #e2e8f0; /* 单元格边框 */
          padding: 10px 12px;
          vertical-align: top;
          box-sizing: border-box;
        }

        .article-content th {
          font-weight: bold;
          text-align: left;
          background-color: #f8fafc; /* 表头背景色 */
        }

        .article-content pre {
          background: #1e293b;
          color: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          overflow-x: auto;
        }

        .article-content blockquote {
          border-left: 4px solid #818cf8;
          background: #f8fafc;
          padding: 1rem;
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
}
