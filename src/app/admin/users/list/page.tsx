"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Card,
  Popconfirm,
  message,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Image from "next/image";
import { getUserListAction } from "@/actions/user.actions";

interface UserItem {
  id: string;
  username: string;
  nickname: string;
  role: string;
  permissions: string[];
  status: "active" | "disabled";
  createTime: string;
}

export default function UserListPage() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 模拟搜索表单状态
  const [searchParams, setSearchParams] = useState({
    username: "",
    status: undefined,
  });

  // 使用 Ref 保存最新的搜索参数，它改变不会触发函数重造
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const fetchData = useCallback(
    async (current = pagination.current, pageSize = pagination.pageSize) => {
      setLoading(true);

      // 从 Ref 中直接读取当前最新的搜索值
      const { username, status } = searchParamsRef.current;

      const query = {
        username,
        status,
        page: current,
        pageSize,
      };
      try {
        const res = await getUserListAction(query);

        if (res.success) {
          setDataSource(res.result.list as any);
          setPagination((prev) => {
            return {
              ...prev,
              total: res.result.total,
            };
          });
        } else {
          message.error("获取数据失败");
        }
      } catch (e) {
        message.error("获取数据失败");
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize],
  );

  useEffect(() => {
    fetchData().then();
  }, [fetchData]);

  const handleDelete = (id: string) => {
    message.success(`删除成功: ${id}`);
    setDataSource(dataSource.filter((item) => item.id !== id));
  };

  const onSearch = () => {
    fetchData(1, pagination.pageSize).then();
  };

  const onReset = () => {
    const defaultParams = { username: "", status: undefined };
    setSearchParams(defaultParams);
    searchParamsRef.current = defaultParams; // 立即同步 Ref
    fetchData(1, pagination.pageSize);
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: "用户名",
      align: "center",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "头像",
      align: "center",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => (
        <Avatar src={avatar || null} icon={<UserOutlined />} />
      ),
    },
    {
      title: "昵称",
      align: "center",
      dataIndex: "nickname",
      key: "nickname",
    },
    {
      title: "角色",
      align: "center",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "pro" : "blue"}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Email",
      align: "center",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "联系方式",
      align: "center",
      dataIndex: "phone",
    },
    {
      title: "状态",
      dataIndex: "status",
      align: "center",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "正常" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      align: "center",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "操作",
      align: "center",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该用户吗？"
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
      <Card variant={"borderless"}>
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space wrap>
            <Input
              placeholder="搜索用户名"
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              value={searchParams.username}
              onPressEnter={onSearch}
              onChange={(e) =>
                setSearchParams({ ...searchParams, username: e.target.value })
              }
            />
            <Select
              placeholder="用户状态"
              style={{ width: 120 }}
              allowClear
              options={[
                { value: "active", label: "正常" },
                { value: "disabled", label: "禁用" },
              ]}
              onChange={(val) =>
                setSearchParams({ ...searchParams, status: val })
              }
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              重置
            </Button>
          </Space>

          <Button type="primary" icon={<PlusOutlined />}>
            新增用户
          </Button>
        </div>

        {/* 2. 数据表格 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
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
    </div>
  );
}
