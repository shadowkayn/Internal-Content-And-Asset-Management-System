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
} from "@ant-design/icons";
import CommonSelect from "@/components/common/CommonSelect";
import ContentModal from "@/app/admin/contents/list/components/ContentModal";
import "./list.scss";
import {
  deleteContentAction,
  getArticleListAction,
} from "@/actions/content.actions";
import { useDictOptions } from "@/hooks/useDictOptions";

interface ContentItem {
  id?: string;
  title: string;
  cover: string;
  category: string;
  status: string;
  content: string;
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

  // 表格列定义
  const columns: any = [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (text: string, record: any, index: number) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "封面",
      dataIndex: "cover",
      key: "cover",
      align: "center",
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

      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      align: "center",

      render: (category: string) => {
        const item = contentCategoryOptions.find((i) => i.value === category);
        return <Tag color="blue">{item.label}</Tag>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      align: "center",

      render: (status: string) => {
        const item = contentStatusOptions.find((i) => i.value === status);
        return <Tag color={"#44706b"}>{item.label}</Tag>;
      },
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
      align: "center",
      render: (author: any) => {
        return author.nickname;
      },
    },
    {
      title: "发布日期",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
    },
    {
      title: "更新人",
      dataIndex: "updater",
      key: "updater",
      align: "center",
      render: (author: any) => {
        return author?.nickname || "--";
      },
    },
    {
      title: "更新日期",
      dataIndex: "updatedAt",
      key: "updatedAt",
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
            onClick={() => editContentFunc(record)}
            style={{ color: "#1890ff" }}
          >
            编辑
          </Button>
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
        </Space>
      ),
    },
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

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => addContentFunc()}
          >
            新增内容
          </Button>
        </Form>
      </Card>

      {/* 表格区域 */}
      <Card variant={"outlined"}>
        <Table
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
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
    </div>
  );
}
