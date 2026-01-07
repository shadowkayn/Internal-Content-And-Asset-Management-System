"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Card,
  Form,
  Select,
  Popconfirm,
  message,
  Image,
  Modal,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import CommonSelect from "@/components/common/CommonSelect";
import ContentModal from "@/app/admin/contents/list/components/ContentModal";

const { Option } = Select;

// 模拟数据类型
interface ContentItem {
  id: string;
  title: string;
  cover: string;
  category: string;
  status: "published" | "draft" | "archived";
  author: string;
  createdAt: string;
}

export default function ContentListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 模拟数据
  const initialData: ContentItem[] = [
    {
      id: "1",
      title: "如何使用 React Server Components",
      cover: "https://picsum.photos/100/60?random=1",
      category: "技术",
      status: "published",
      author: "KAYN",
      createdAt: "2023-10-24",
    },
    {
      id: "2",
      title: "2024 UI 设计趋势展望",
      cover: "https://picsum.photos/100/60?random=2",
      category: "设计",
      status: "draft",
      author: "Admin",
      createdAt: "2023-10-25",
    },
    {
      id: "3",
      title: "后台系统权限架构设计",
      cover: "https://picsum.photos/100/60?random=3",
      category: "架构",
      status: "published",
      author: "KAYN",
      createdAt: "2023-10-26",
    },
  ];

  const onClose = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const onSuccessCallback = () => {
    onClose();
  };

  // 删除操作
  const handleDelete = (id: string) => {};

  // 打开编辑/新增弹窗
  const showModal = (record?: ContentItem) => {
    setEditItem(record || null);
    setIsModalOpen(true);
  };

  // 表格列定义
  const columns: any = [
    {
      title: "封面",
      dataIndex: "cover",
      key: "cover",
      align: "center",
      render: (text: string) => (
        <Image src={text} width={60} style={{ borderRadius: 4 }} alt="" />
      ),
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      align: "center",

      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      align: "center",

      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      align: "center",

      render: (status: string) => {
        const statusMap = {
          published: { color: "green", text: "已发布" },
          draft: { color: "default", text: "草稿" },
          archived: { color: "red", text: "已归档" },
        };
        const item = statusMap[status as keyof typeof statusMap];
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
      align: "center",
    },
    {
      title: "发布日期",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
    },
    {
      title: "更新日期",
      dataIndex: "updateAt",
      key: "updateAt",
      align: "center",
    },
    {
      title: "操作",
      key: "action",
      align: "center",

      render: (_: any, record: ContentItem) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ color: "#1890ff" }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这篇文章吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 搜索筛选区域 */}
      <Card variant={"outlined"} style={{ marginBottom: 0 }}>
        <Form
          layout="inline"
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          <Space wrap>
            <Form.Item name="keyword" label={"内容标题"}>
              <Input
                placeholder="输入标题关键词"
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
              />
            </Form.Item>
            <Form.Item name="status" label={"内容状态"}>
              <CommonSelect
                dictCode="sys_content_status"
                placeholder="请选择状态"
                style={{ width: 120 }}
                allowClear
              />
            </Form.Item>
            <Form.Item name="category" label={"内容分类"}>
              <CommonSelect
                dictCode="sys_content_category"
                placeholder="请选择分类"
                style={{ width: 120 }}
                allowClear
              />
            </Form.Item>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />}>重置</Button>
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            新增内容
          </Button>
        </Form>
      </Card>

      {/* 表格区域 */}
      <Card variant={"outlined"}>
        <Table
          columns={columns}
          dataSource={initialData}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize,
              }));
            },
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <ContentModal
        isModalOpen={isModalOpen}
        isEditMode={isEditMode}
        onClose={onClose}
        initialData={editItem}
        onSuccessCallback={onSuccessCallback}
      />
    </div>
  );
}
