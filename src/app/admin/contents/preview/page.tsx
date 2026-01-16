"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Input,
  Space,
  Avatar,
  Tag,
  Pagination,
  Typography,
  Empty,
  Form,
  message,
} from "antd";
import { SearchOutlined, CalendarOutlined } from "@ant-design/icons";
import CommonSelect from "@/components/common/CommonSelect";
import { getArticleListAction } from "@/actions/content.actions";
import { useDictOptions } from "@/hooks/useDictOptions";
import { useRouter } from "next/dist/client/components/navigation";

const { Title, Text, Paragraph } = Typography;

export default function ContentsPreviewPage() {
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [dataSource, setDataSource] = useState([]);
  const { options: contentCategoryOptions } = useDictOptions(
    "sys_content_category",
  );
  const router = useRouter();

  useEffect(() => {
    loadListData().then();
  }, []);

  const getArticleCategory = (category: string) => {
    const categoryOption = contentCategoryOptions.find(
      (item: any) => item.value === category,
    );
    return categoryOption?.label || "未知";
  };

  // 状态颜色映射
  const statusConfig: any = {
    published: {
      color: "#52c41a",
      text: "已发布",
      cover:
        "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop",
    },
    draft: {
      color: "#faad14",
      text: "草稿",
      cover:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    },
    archived: {
      color: "#ff4d4f",
      text: "已归档",
      cover:
        "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop",
    },
  };

  const loadListData = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
  ) => {
    setLoading(true);
    const { keyword, status, category } = searchForm.getFieldsValue();
    const params = {
      title: keyword,
      status,
      category,
      page,
      pageSize,
    };

    try {
      const res: any = await getArticleListAction(params);
      if (res.success) {
        const result = res.data.list?.map((item: any) => {
          const { status, cover } = item;
          return {
            ...item,
            cover: cover || (statusConfig?.[status]?.cover as string),
          };
        });
        setDataSource(result);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total || 0,
        }));
      } else {
        message.error(res.error || "获取数据失败");
      }
    } catch (e: any) {
      message.error(e.message || "获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  const onRouterDetailPage = (id: string) => {
    router.push(`/admin/contents/preview/${id}`);
  };

  return (
    <div style={{ padding: "0 8px" }}>
      {/* 顶部工具栏：搜索与筛选 */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
        className={"search-card-box"}
      >
        <Form
          form={searchForm}
          name="content_search"
          style={{ paddingBottom: 0 }}
        >
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} md={12}>
              <Form.Item name="keyword">
                <Input
                  placeholder="搜索文章标题或关键词..."
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  size="large"
                  allowClear
                  style={{ borderRadius: 8, width: "100%" }}
                  onPressEnter={() => loadListData(1)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Space
                size="middle"
                style={{ width: "100%", justifyContent: "flex-end" }}
              >
                <Form.Item name="category">
                  <CommonSelect
                    dictCode="sys_content_category"
                    placeholder="请选择分类"
                    size="large"
                    allowClear
                    onChange={() => loadListData(1)}
                  />
                </Form.Item>
                <Form.Item name="status">
                  <CommonSelect
                    dictCode="sys_content_status"
                    placeholder="请选择状态"
                    size="large"
                    allowClear
                    onChange={() => loadListData(1)}
                  />
                </Form.Item>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
      {/* 内容流网格 */}
      <Row gutter={[24, 24]}>
        {dataSource.length > 0 ? (
          dataSource.map((item: any) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
              <Badge.Ribbon
                text={
                  statusConfig[item.status as keyof typeof statusConfig].text
                }
                color={
                  statusConfig[item.status as keyof typeof statusConfig].color
                }
              >
                <Card
                  loading={loading}
                  hoverable
                  cover={
                    <div
                      style={{
                        overflow: "hidden",
                        height: 180,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                    >
                      <img
                        alt={item.title}
                        src={item.cover}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.05)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      />
                    </div>
                  }
                  style={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    padding: "16px",
                  }}
                  onClick={() => onRouterDetailPage(item.id)}
                >
                  <Tag color="blue" style={{ marginBottom: 8 }}>
                    {getArticleCategory(item.category)}
                  </Tag>

                  <Title
                    level={5}
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 12, minHeight: 44 }}
                  >
                    {item.title}
                  </Title>

                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ fontSize: 13, marginBottom: 16 }}
                  >
                    {item?.description || "--"}
                  </Paragraph>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                    }}
                  >
                    <Space>
                      <Avatar src={item?.author?.avatar} size="small" />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item?.author.nickname}
                      </Text>
                    </Space>
                    <Space style={{ color: "#bfbfbf", fontSize: 12 }}>
                      <CalendarOutlined />
                      {item.createdAt}
                    </Space>
                  </div>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))
        ) : (
          <Col span={24}>
            {" "}
            {/* 使用 Col 包裹 */}
            <div style={{ margin: "204px 0", textAlign: "center" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无数据"
              />
            </div>
          </Col>
        )}
      </Row>
      {/* 分页 */}
      <div
        style={{
          textAlign: "center",
          marginTop: 40,
          paddingBottom: 20,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {dataSource.length > 0 && (
          <Pagination
            current={pagination.current}
            total={pagination.total}
            showSizeChanger={false}
            showTotal={(total) => `共${total}条数据`}
            onChange={(page) => {
              loadListData(page).then();
            }}
          />
        )}
      </div>

      {/*style*/}
      <style jsx>{`
        .search-card-box .ant-card-body {
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
}
