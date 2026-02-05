"use client";

import {
  Button,
  Card,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import RoleModal from "./components/RoleModal";
import {
  deleteRoleAction,
  getRoleListAction,
  updateRoleStatusAction,
} from "@/actions/role.action";

export default function UserRolePage() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadData().then();
  }, []);

  const loadData = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
  ) => {
    const params = {
      page,
      pageSize,
      keywords: form.getFieldValue("keywords"),
      status: form.getFieldValue("status"),
    };

    try {
      setTableLoading(true);
      const res: any = await getRoleListAction(params);
      if (res.success) {
        setDataSource(res.data?.list || []);
        setPagination((prev) => ({
          ...prev,
          total: res.data?.total || 0,
        }));
      } else {
        message.error(res.error || "获取角色列表失败");
      }
    } catch (e: any) {
      message.error(e.error || "获取角色列表失败");
    } finally {
      setTableLoading(false);
    }
  };

  const onReset = async () => {
    form.resetFields();
    await loadData(1);
  };

  const addRoleFunc = () => {
    setIsModalOpen(true);
    setEditingRole(null);
  };

  const onEditRoleFunc = (row: any) => {
    setIsModalOpen(true);
    setEditingRole(row);
  };

  const onSuccessCallback = async () => {
    setIsModalOpen(false);
    await loadData(1);
  };

  const onChangeStatus = async (checked: boolean, record: any) => {
    const params = {
      id: record?.id,
      status: checked ? "active" : "disabled",
    };
    try {
      setTableLoading(true);
      const res = await updateRoleStatusAction(params);
      if (res.success) {
        message.info(`角色状态已: ${checked ? "启用" : "禁用"}`);
        await loadData();
      } else {
        message.error(res.error || "操作失败");
      }
    } catch (e) {
    } finally {
      setTableLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ids = [id];
    try {
      setTableLoading(true);
      const res = await deleteRoleAction(ids);
      if (res.success) {
        message.info("删除成功");
        await loadData(1);
      } else {
        message.error(res.error || "操作失败");
      }
    } catch (e: any) {
      message.error(e.message || "操作失败");
    } finally {
      setTableLoading(false);
    }
  };

  const columns: any = [
    {
      title: "序号",
      key: "index",
      align: "center",
      width: 80,
      render: (_: any, __: any, index: number) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
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
      dataIndex: "description",
      key: "description",
      align: "center",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (val: string, row: any) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={val === "active"}
          onChange={(checked) => onChangeStatus(checked, row)}
        />
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
            onClick={() => onEditRoleFunc(record)}
          >
            编辑
          </Button>
          <Popconfirm
            placement={"topLeft"}
            title="确定要删除该角色吗？"
            description="删除后该角色绑定的相关人员将失效，请谨慎操作。"
            onConfirm={() => handleDelete(record.id!)}
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
      {/*搜索区域*/}
      <Card variant="borderless" style={{ borderRadius: 16 }}>
        <Form layout="inline" form={form}>
          <Form.Item label="关键字" name="keywords">
            <Input
              placeholder="请输入角色名称或角色标识"
              style={{ width: 240 }}
            />
          </Form.Item>

          <Form.Item label="角色状态" name="status">
            <Select placeholder="请选择角色状态" style={{ width: 140 }}>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="disabled">禁用</Select.Option>
            </Select>
          </Form.Item>

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => loadData()}
          >
            查询
          </Button>
          <Button
            icon={<ReloadOutlined />}
            style={{ marginLeft: 8 }}
            onClick={onReset}
          >
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
            onClick={() => addRoleFunc()}
          >
            新增角色
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={tableLoading}
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

      <RoleModal
        isModalOpen={isModalOpen}
        editingRole={editingRole}
        onClose={() => setIsModalOpen(false)}
        onSuccessCallback={onSuccessCallback}
      />
    </div>
  );
}
