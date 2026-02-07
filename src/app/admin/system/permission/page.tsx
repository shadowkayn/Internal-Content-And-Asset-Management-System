"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Card, Popconfirm, message } from "antd";
import {
  PlusOutlined,
  NodeIndexOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import RootPermissionModal from "@/app/admin/system/permission/components/RootPermissionModal";
import PermissionModal from "@/app/admin/system/permission/components/PermissionModal";
import {
  deletePermissionAction,
  getPermissionListAction,
} from "@/actions/permission.action";

interface PermissionNode {
  id: string;
  name: string;
  code: string;
  type: "menu" | "button";
  parentId: string | null;
  sort: number;
  children?: PermissionNode[];
}

export default function PermissionManagePage() {
  const [loading, setLoading] = useState(false);
  const [permissionTreeData, setPermissionTreeData] = useState<
    PermissionNode[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isRootModalOpen, setIsRootModalOpen] = useState(false);
  const [editingRootItem, setEditingRootItem] = useState<any>(null);
  const [parentId, setParentId] = useState(null);
  const [parentPath, setParentPath] = useState(null);

  const getPermissionTreeAction = async () => {
    try {
      setLoading(true);
      const res: any = await getPermissionListAction();
      if (res.success) {
        setPermissionTreeData(res.data?.list || []);
      } else {
        message.error(res.message || "获取权限🌲失败");
      }
    } catch (e: any) {
      message.error(e.message || "获取权限🌲失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPermissionTreeAction().then();
  }, []);

  const onEditItem = (row: any) => {
    const { parentId } = row;
    if (!parentId) {
      setEditingRootItem(row);
      setIsRootModalOpen(true);
      return;
    }

    setEditingItem(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const ids = [id];
      const res: any = await deletePermissionAction(ids);
      if (res.success) {
        message.success("删除成功");
        getPermissionTreeAction().then();
      } else {
        message.error(res.error || "删除失败");
      }
    } catch (e) {
      message.error("删除失败");
    } finally {
      setLoading(false);
    }
  };

  const onAddChildItem = (row: any) => {
    setParentId(row.code);
    setParentPath(row.path);
    setIsModalOpen(true);
  };

  const handleOpenRootModal = (record?: any) => {
    setEditingRootItem(record || null);
    setIsRootModalOpen(true);
  };

  const onRootSuccessCallback = () => {
    setEditingRootItem(null);
    setIsRootModalOpen(false);
    getPermissionTreeAction().then();
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setParentId(null);
    setParentPath(null);
  };

  const onSuccessCallback = () => {
    setEditingItem(null);
    setIsModalOpen(false);
    getPermissionTreeAction().then();
  };

  const columns: any = [
    {
      title: "权限名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Space>
          {record.type === "menu" ? (
            <AppstoreAddOutlined style={{ color: "#1890ff" }} />
          ) : (
            <NodeIndexOutlined style={{ color: "#52c41a" }} />
          )}
          <span style={{ fontWeight: record.parentId === null ? 600 : 400 }}>
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: "权限标识 (Code)",
      dataIndex: "code",
      key: "code",
      align: "center",
      render: (code: string) => (
        <Tag color="blue" style={{ borderRadius: 6 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type: string) => (
        <Tag color={type === "menu" ? "orange" : "green"}>
          {type === "menu" ? "菜单/模块" : "功能/按钮"}
        </Tag>
      ),
    },
    { title: "排序", dataIndex: "sort", key: "sort", align: "center" },
    {
      title: "操作",
      key: "action",
      align: "center",
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.type === "menu" && (
            <Button
              type="link"
              size="small"
              onClick={() => onAddChildItem(record)}
            >
              添加子项
            </Button>
          )}
          <Button type="link" size="small" onClick={() => onEditItem(record)}>
            编辑
          </Button>
          <Popconfirm
            title={
              record.children
                ? "确定删除吗？子权限也将一并删除"
                : "确定要删除该权限点吗？"
            }
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card
        variant="outlined"
        style={{ borderRadius: 16 }}
        title="权限定义管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenRootModal()}
          >
            新增根权限
          </Button>
        }
      >
        <Table
          loading={loading}
          columns={columns}
          dataSource={permissionTreeData}
          rowKey="id"
          pagination={false}
          style={{ background: "transparent" }}
        />
      </Card>

      <PermissionModal
        isModalOpen={isModalOpen}
        editingItem={editingItem}
        parentId={parentId}
        parentPath={parentPath}
        onClose={onCloseModal}
        onSuccessCallback={onSuccessCallback}
      />

      <RootPermissionModal
        isModalOpen={isRootModalOpen}
        editingItem={editingRootItem}
        onClose={() => setIsRootModalOpen(false)}
        onSuccessCallback={onRootSuccessCallback}
      />
    </div>
  );
}
