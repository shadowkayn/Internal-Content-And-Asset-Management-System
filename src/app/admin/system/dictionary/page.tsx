"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  addDictAction,
  deleteDictAction,
  getDictListAction,
  updateDictBasicInfoAction,
  updateDictStatus,
} from "@/actions/sysDict.actions";
import DictDataModel from "@/app/admin/system/dictionary/components/DictDataModel";

// 字典类型定义
interface DictType {
  id: string;
  dictName: string; // 字典名称：如“用户性别”
  dictCode: string; // 字典类型：如“sys_user_sex”
  dictStatus: string; // 状态：启用/禁用
  dictRemark: string; // 备注
  createTime: string;
}

export default function DictManagementPage() {
  const [searchForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DictType | null>(null);
  const [dataSource, setDataSource] = useState<DictType[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 控制数据子弹窗的状态
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [currentDict, setCurrentDict] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 打开数据子弹窗的方法
  const openDataModal = (record: DictType) => {
    setCurrentDict({ id: record.id, name: record.dictName });
    setIsDataModalOpen(true);
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[], selectedRows: DictType[]) => {
      setSelectedRowKeys(selectedKeys as string[]);
    },
  };
  const [dataForm] = Form.useForm();

  const getDictList = useCallback(
    async (page?: number, size?: number) => {
      const { dictName, dictType } = searchForm.getFieldsValue();
      const current = page || pagination.current;
      const pageSize = size || pagination.pageSize;
      const params = {
        dictName,
        dictType,
        page: current,
        pageSize,
      };
      setTableLoading(true);

      try {
        const result = await getDictListAction(params);
        if (result.success) {
          setDataSource(result.list || []);
          setPagination({
            current: current,
            pageSize: pageSize,
            total: result.total || 0,
          });
        } else {
          message.error(result.error || "获取数据失败");
        }
      } catch (e) {
        message.error("获取数据失败");
      } finally {
        setTableLoading(false);
      }
    },
    [searchForm],
  );

  const resetDictList = () => {
    searchForm.resetFields();
    getDictList(1, 10);
  };

  useEffect(() => {
    getDictList();
  }, []);

  const handleDelete = async (id: string) => {
    const ids = [id];
    const res = await deleteDictAction(ids);
    if (res.success) {
      message.success("删除成功");
      await getDictList();
    } else {
      message.error(res.error);
    }
  };

  const showModal = (record?: DictType) => {
    setEditingItem(record || null);
    setIsModalOpen(true);

    if (record) {
      // 将数据库字段映射到表单字段
      dataForm.setFieldsValue({
        dictName: record.dictName,
        dictCode: record.dictCode,
        dictStatus: record.dictStatus === "active",
        dictRemark: record.dictRemark,
      });
    } else {
      dataForm.resetFields();
    }
  };

  const onChangeStatus = async (checked: boolean, record: any) => {
    const params = {
      id: record?.id,
      dictStatus: checked ? "active" : "inactive",
    };
    const res = await updateDictStatus(params);
    if (res.success) {
      message.info(`状态已改为: ${checked ? "开启" : "关闭"}`);
      await getDictList();
    }
  };

  const columns: any = [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 80,
      render: (text: string, record: any, index: number) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "字典名称",
      dataIndex: "dictName",
      key: "dictName",
      align: "center",
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "字典类型",
      dataIndex: "dictCode",
      key: "dictType",
      align: "center",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "dictStatus",
      key: "dictStatus",
      align: "center",
      render: (status: string, record: any) => (
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          checked={status === "active"}
          onChange={(checked) => onChangeStatus(checked, record)}
        />
      ),
    },
    {
      title: "备注",
      dataIndex: "dictRemark",
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
      dataIndex: "createdAt",
      key: "createTime",
      align: "center",
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      width: 360,
      render: (_: any, record: DictType) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<UnorderedListOutlined />}
            style={{ color: "#52c41a" }}
            onClick={() => openDataModal(record)}
          >
            字典数据
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

  const submitFunc = async () => {
    const data = await dataForm.validateFields();

    try {
      const params = {
        id: editingItem?.id,
        dictName: data.dictName,
        dictCode: data.dictCode,
        dictStatus: data.dictStatus ? "active" : "inactive",
        dictRemark: data.dictRemark,
      };

      const res = editingItem
        ? await updateDictBasicInfoAction(params)
        : await addDictAction(params);
      if (res.success) {
        message.success("保存成功");
        setIsModalOpen(false);
        dataForm.resetFields();
        setEditingItem(null);
        await getDictList();
      } else {
        message.error(res.error);
      }
    } catch (e: any) {
      message.error(e?.message || "保存失败");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请至少选择一项");
      return;
    }

    // 二次确认弹窗
    Modal.confirm({
      title: "确定要批量删除吗？",
      content: "删除后相关配置可能失效，请谨慎操作。",
      onOk: async () => {
        try {
          const res = await deleteDictAction(selectedRowKeys);
          if (res.success) {
            message.success("批量删除成功");
            setSelectedRowKeys([]);
            await getDictList();
          } else {
            message.error(res.error);
          }
        } catch (e) {
          message.error("批量删除失败");
        }
      },
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 搜索栏 */}
      <Card variant={"borderless"}>
        <Form form={searchForm} layout="inline" style={{ width: "100%" }}>
          <Space wrap size={16}>
            <Form.Item name="dictName" label="字典名称">
              <Input placeholder="请输入字典名称" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="dictType" label="字典类型">
              <Input placeholder="请输入字典类型" style={{ width: 200 }} />
            </Form.Item>
            <Button
              onClick={() => getDictList(1)}
              type="primary"
              icon={<SearchOutlined />}
            >
              查询
            </Button>
            <Button onClick={resetDictList} icon={<ReloadOutlined />}>
              重置
            </Button>
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
          <Button
            onClick={handleBatchDelete}
            danger
            style={{ marginLeft: 8 }}
            icon={<DeleteOutlined />}
          >
            批量删除
          </Button>
        </div>

        <Table
          columns={columns}
          rowSelection={rowSelection}
          dataSource={dataSource}
          rowKey="id"
          loading={tableLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showQuickJumper: true,
            showSizeChanger: true,
            onChange: (page, pageSize) => {
              getDictList(page, pageSize);
            },
          }}
        />
      </Card>

      {currentDict && (
        <DictDataModel
          open={isDataModalOpen}
          dictId={currentDict.id}
          dictName={currentDict.name}
          onCancel={() => {
            setIsDataModalOpen(false);
            setCurrentDict(null);
          }}
        />
      )}

      {/* 弹窗 */}
      <Modal
        title={editingItem ? "修改字典" : "新增字典"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={submitFunc}
        width={500}
      >
        <Form
          form={dataForm}
          layout="vertical"
          initialValues={editingItem || { dictStatus: true }}
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
            label="字典编码"
            name="dictCode"
            rules={[{ required: true, message: "请输入字典编码" }]}
            tooltip="建议以 sys_ 开头"
          >
            <Input placeholder="请输入类型（如 sys_status）" />
          </Form.Item>
          <Form.Item label="状态" name="dictStatus" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Form.Item label="备注" name="dictRemark">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
