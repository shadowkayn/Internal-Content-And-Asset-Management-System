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
  Switch,
  Popconfirm,
  message,
  Modal,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

// 字典类型定义
interface DictType {
  id: string;
  dictName: string; // 字典名称：如“用户性别”
  dictType: string; // 字典类型：如“sys_user_sex”
  status: boolean; // 状态：启用/禁用
  remark: string; // 备注
  createTime: string;
}

export default function DictManagementPage() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DictType | null>(null);

  // 模拟字典数据
  const [dataSource, setDataSource] = useState<DictType[]>([
    {
      id: "1",
      dictName: "用户性别",
      dictType: "sys_user_sex",
      status: true,
      remark: "用户性别列表",
      createTime: "2023-12-01 10:00:00",
    },
    {
      id: "2",
      dictName: "通知类型",
      dictType: "sys_notice_type",
      status: true,
      remark: "系统通知公告类型",
      createTime: "2023-12-05 14:20:00",
    },
    {
      id: "3",
      dictName: "系统状态",
      dictType: "sys_common_status",
      status: false,
      remark: "通用状态字典",
      createTime: "2023-12-10 09:15:00",
    },
  ]);

  const handleDelete = (id: string) => {
    setDataSource(dataSource.filter((item) => item.id !== id));
    message.success("删除成功");
  };

  const showModal = (record?: DictType) => {
    setEditingItem(record || null);
    setIsModalOpen(true);
  };

  const columns: any = [
    {
      title: "字典名称",
      dataIndex: "dictName",
      key: "dictName",
      align: "center",
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "字典类型",
      dataIndex: "dictType",
      key: "dictType",
      align: "center",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: boolean) => (
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          defaultChecked={status}
          onChange={(checked) =>
            message.info(`状态已改为: ${checked ? "开启" : "关闭"}`)
          }
        />
      ),
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      align: "center",
      ellipsis: true, // 自动省略
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ color: "#8c8c8c" }}>{text || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      align: "center",
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      width: 280,
      render: (_: any, record: DictType) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该字典吗？"
            description="删除后相关配置可能失效，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 搜索栏 */}
      <Card variant={"borderless"}>
        <Form layout="inline" style={{ width: "100%" }}>
          <Space wrap size={16}>
            <Form.Item label="字典名称">
              <Input placeholder="请输入字典名称" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item label="字典类型">
              <Input placeholder="请输入字典类型" style={{ width: 200 }} />
            </Form.Item>
            <Button type="primary" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />}>重置</Button>
          </Space>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card variant={"borderless"}>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            新增字典
          </Button>
          <Button danger style={{ marginLeft: 8 }} icon={<DeleteOutlined />}>
            批量删除
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            total: dataSource.length,
          }}
        />
      </Card>

      {/* 弹窗 */}
      <Modal
        title={editingItem ? "修改字典" : "新增字典"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => {
          message.success("保存成功");
          setIsModalOpen(false);
        }}
        width={500}
      >
        <Form
          layout="vertical"
          initialValues={editingItem || { status: true }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="字典名称"
            name="dictName"
            rules={[{ required: true, message: "请输入字典名称" }]}
            tooltip="建议使用中文，如：用户状态"
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item
            label="字典类型"
            name="dictType"
            rules={[{ required: true, message: "请输入字典类型" }]}
            tooltip="建议以 sys_ 或 bus_ 开头"
          >
            <Input placeholder="请输入类型（如 sys_status）" />
          </Form.Item>
          <Form.Item label="状态" name="status" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
