"use client";

import {
  Button,
  Card,
  Form,
  Input,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import RoleModal from "./components/RoleModal";

export default function UserRolePage() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [rolesData, setRolesData] = useState([
    {
      id: "1",
      name: "超级管理员",
      code: "admin",
      desc: "拥有系统所有权限",
      status: "active",
      permissions: ["dashboard", "content", "user", "system"],
      createdAt: "2023-10-01",
    },
    {
      id: "2",
      name: "内容编辑",
      code: "editor",
      desc: "负责内容发布与维护",
      status: "active",
      permissions: ["content:list", "content:edit"],
      createdAt: "2023-11-15",
    },
    {
      id: "3",
      name: "普通访客",
      code: "viewer",
      desc: "仅拥有查看权限",
      status: "active",
      permissions: ["content:list", "content:preview"],
      createdAt: "2023-12-20",
    },
  ]);

  const showModal = (role?: any) => {
    setEditingRole(role || null);
    if (role) {
      form.setFieldsValue(role);
      setCheckedKeys(role.permissions || null);
    } else {
      form.resetFields();
      setCheckedKeys([]);
    }
    setIsModalOpen(true);
  };

  const columns: any = [
    {
      title: "角色名称",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text: string) => (
        <Typography.Text strong>{text}</Typography.Text>
      ),
    },
    {
      title: "角色标识",
      dataIndex: "code",
      key: "code",
      align: "center",
      render: (code: string) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: "描述",
      dataIndex: "desc",
      key: "desc",
      align: "center",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string) => (
        <Switch checked={status === "active"} size="default" />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/*搜索区域*/}
      <Card variant="borderless" style={{ borderRadius: 16 }}>
        <Form layout="inline">
          <Form.Item label="角色名称">
            <Input placeholder="请输入" />
          </Form.Item>
          <Button type="primary" icon={<SearchOutlined />}>
            查询
          </Button>
          <Button icon={<ReloadOutlined />} style={{ marginLeft: 8 }}>
            重置
          </Button>
        </Form>
      </Card>

      <Card
        variant="borderless"
        style={{ borderRadius: 16 }}
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>角色列表</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            新增角色
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rolesData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <RoleModal
        isModalOpen={isModalOpen}
        editingRole={editingRole}
        onClose={() => setIsModalOpen(false)}
        onSuccessCallback={() => {
          setIsModalOpen(false);
          setRolesData((prevData: any) => {
            if (editingRole) {
              return prevData.map((role: any) =>
                role.id === editingRole.id ? editingRole : role,
              );
            } else {
              return [...prevData, editingRole];
            }
          });
        }}
      />
    </div>
  );
}
