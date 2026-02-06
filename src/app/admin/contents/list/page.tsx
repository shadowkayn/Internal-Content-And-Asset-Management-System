"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckOutlined,
  SendOutlined,
} from "@ant-design/icons";
import CommonSelect from "@/components/common/CommonSelect";
import ContentModal from "@/app/admin/contents/list/components/ContentModal";
import ReviewModal from "@/app/admin/contents/list/components/ReviewModal";
import "./list.scss";
import {
  deleteContentAction,
  getArticleListAction,
  submitForReviewAction,
} from "@/actions/content.actions";
import { useDictOptions } from "@/hooks/useDictOptions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermission } from "@/hooks/usePermission";

interface ContentItem {
  id?: string;
  title: string;
  cover: string;
  category: string;
  status: string;
  content: string;
  author?: {
    id: string;
    nickname: string;
  };
  createdAt?: string;
  description?: string;
}

export function DefaultCover() {
  return <div className={"default-cover"}></div>;
}

export default function ContentListPage() {
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<ContentItem | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dataSource, setDataSource] = useState([]);
  const { options: contentCategoryOptions } = useDictOptions(
    "sys_content_category",
  );
  const { options: contentStatusOptions } =
    useDictOptions("sys_content_status");
  const userInfo = useCurrentUser();
  const isAdmin = userInfo?.role === "admin";
  const currentUserId = userInfo?._id || userInfo?.id;
  const currentUserRole = userInfo?.role;
  const { hasPermission } = usePermission();

  const loadData = async (
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
        setDataSource(res.data.list);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: res.data.total || 0,
        });
      } else {
        message.error(res.error || "获取数据失败");
      }
    } catch (e: any) {
      message.error(e.message || "获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().then();
  }, []);

  const onSearch = () => {
    loadData(1); // 搜索从第一页开始
  };

  const onReset = () => {
    searchForm.resetFields();
    loadData(1);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    loadData(page, pageSize);
  };

  const onClose = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const onSuccessCallback = () => {
    onClose();
    loadData(1);
  };

  // 删除操作
  const handleDelete = async (id: string) => {
    const ids = [id];
    try {
      setLoading(true);
      const res = await deleteContentAction(ids);
      if (res.success) {
        message.success("删除成功");
        await loadData(1);
      } else {
        message.error(res.error || "删除失败");
      }
    } catch (e: any) {
      message.error(e.message || "删除失败");
    } finally {
      setLoading(false);
    }
  };

  const addContentFunc = () => {
    setIsModalOpen(true);
    setEditItem(null);
    setIsEditMode(false);
  };

  const editContentFunc = (record: any) => {
    setIsModalOpen(true);
    setEditItem(record);
    setIsEditMode(true);
  };

  // 打开审核弹窗
  const openReviewModal = (record: any) => {
    setReviewItem(record);
    setIsReviewModalOpen(true);
  };

  // 关闭审核弹窗
  const closeReviewModal = () => {
    setReviewItem(null);
    setIsReviewModalOpen(false);
  };

  // 审核成功回调
  const onReviewSuccess = () => {
    closeReviewModal();
    loadData(1);
  };

  // 提交审核
  const handleSubmitForReview = async (id: string) => {
    try {
      setLoading(true);
      const res = await submitForReviewAction(id);
      if (res.success) {
        message.success("已提交审核");
        await loadData();
      } else {
        message.error(res.error || "提交审核失败");
      }
    } catch (e: any) {
      message.error(e.message || "提交审核失败");
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: any = [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 70,
      fixed: "left",
      render: (text: string, record: any, index: number) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "封面",
      dataIndex: "cover",
      key: "cover",
      align: "center",
      width: 120,
      render: (src: string) => {
        return src ? (
          <Image
            src={src}
            width={80}
            style={{ borderRadius: 4, objectFit: "cover", aspectRatio: 16 / 9 }}
            alt=""
          />
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DefaultCover />
          </div>
        );
      },
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      ellipsis: true,
      width: 240,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      align: "center",
      width: 100,
      render: (category: string) => {
        const item = contentCategoryOptions.find((i) => i.value === category);
        return <Tag color="blue">{item.label}</Tag>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      align: "center",
      render: (status: string) => {
        const item = contentStatusOptions.find((i) => i.value === status);
        // 根据状态设置不同颜色
        const colorMap: Record<string, string> = {
          pending: "orange",
          published: "green",
          draft: "default",
          archived: "red",
        };
        return <Tag color={colorMap[status] || "default"}>{item?.label}</Tag>;
      },
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
      align: "center",
      width: 120,
      render: (author: any) => {
        return author.nickname;
      },
    },
    {
      title: "发布日期",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 160,
    },
    {
      title: "更新人",
      dataIndex: "updater",
      key: "updater",
      align: "center",
      width: 120,
      render: (author: any) => {
        return author?.nickname || "--";
      },
    },
    {
      title: "更新日期",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      width: 160,
    },
    // 只有有操作权限的用户才显示操作列
    ...(hasPermission("content:update") ||
    hasPermission("content:delete") ||
    currentUserRole === "admin" ||
    currentUserRole === "editor"
      ? [
          {
            title: "操作",
            key: "action",
            align: "center",
            width: 280,
            fixed: "right",
      render: (_: any, record: ContentItem) => (
        <Space size="small">
          {/* 编辑按钮：需要 content:edit 权限 */}
          {hasPermission("content:edit") && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => editContentFunc(record)}
              style={{ color: "#1890ff" }}
            >
              编辑
            </Button>
          )}

          {/* 审核按钮：admin 可以审核所有文章，editor 只能审核别人的文章 */}
          {(() => {
            const isAuthor =
              String(record.author?.id) === String(currentUserId);
            const canReview =
              record.status === "pending" &&
              (isAdmin || (currentUserRole === "editor" && !isAuthor));

            return (
              canReview && (
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => openReviewModal(record)}
                  style={{ color: "#52c41a" }}
                >
                  审核
                </Button>
              )
            );
          })()}

          {/* 提交审核按钮：作者且文章状态为 draft 时显示 */}
          {record.author?.id === currentUserId && record.status === "draft" && (
            <Button
              type="text"
              icon={<SendOutlined />}
              onClick={() => handleSubmitForReview(record.id!)}
              style={{ color: "#1890ff" }}
            >
              提交审核
            </Button>
          )}

          {/* 删除按钮：需要 content:delete 权限 */}
          {hasPermission("content:delete") && (
            <Popconfirm
              title="确定要删除这篇文章吗？"
              onConfirm={() => handleDelete(record.id!)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 搜索筛选区域 */}
      <Card variant={"outlined"} style={{ marginBottom: 0 }}>
        <Form
          form={searchForm}
          layout="inline"
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          <Space wrap>
            <Form.Item name="keyword" label={"文章标题"}>
              <Input
                placeholder="输入标题关键词"
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
              />
            </Form.Item>
            <Form.Item name="status" label={"文章状态"}>
              <CommonSelect
                dictCode="sys_content_status"
                placeholder="请选择状态"
                style={{ width: 120 }}
                allowClear
              />
            </Form.Item>
            <Form.Item name="category" label={"文章分类"}>
              <CommonSelect
                dictCode="sys_content_category"
                placeholder="请选择分类"
                style={{ width: 120 }}
                allowClear
              />
            </Form.Item>
            <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              重置
            </Button>
          </Space>

          {/* 新增按钮：需要 content:add 权限 */}
          {hasPermission("content:add") && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => addContentFunc()}
            >
              新增内容
            </Button>
          )}
        </Form>
      </Card>

      {/* 表格区域 */}
      <Card variant={"outlined"}>
        <Table
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => handleTableChange(page, pageSize),
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <ContentModal
        isModalOpen={isModalOpen}
        isEditMode={isEditMode}
        onClose={onClose}
        editItem={editItem}
        onSuccessCallback={onSuccessCallback}
      />

      {/* 审核弹窗 */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        content={
          reviewItem
            ? {
                id: reviewItem.id!,
                title: reviewItem.title,
                author: reviewItem.author || { nickname: "未知" },
                createdAt: reviewItem.createdAt || "",
                description: reviewItem.description || "",
              }
            : null
        }
        onClose={closeReviewModal}
        onSuccess={onReviewSuccess}
      />
    </div>
  );
}
