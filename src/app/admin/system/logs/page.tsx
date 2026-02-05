"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Card,
  Form,
  Input,
  DatePicker,
  Button,
  Modal,
  Descriptions,
  Typography,
  message,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  MonitorOutlined,
} from "@ant-design/icons";
import { getLogListAction } from "@/actions/log.action";

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function SystemLogsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dataSource, setDataSource] = useState<any>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (page?: number, size?: number) => {
    const current = page || pagination.current;
    const pageSize = size || pagination.pageSize;
    const { moduleName, username, date } = form.getFieldsValue();
    const [start, end] = date || [];
    const query = {
      page: current,
      pageSize,
      logModule: moduleName,
      username,
      startTime: start ? start.format("YYYY-MM-DD") : undefined,
      endTime: end ? end.format("YYYY-MM-DD") : undefined,
    };

    try {
      setLoading(true);
      const res = await getLogListAction(query);

      if (res.success) {
        setDataSource(res.data?.list || []);
        setPagination({
          current: current,
          pageSize: pageSize,
          total: res.data.total,
        });
      } else {
        message.error(res.error || "查询失败");
      }
    } catch (e: any) {
      message.error(e.message || "查询失败");
    } finally {
      setLoading(false);
    }
  };

  const columns: any = [
    {
      title: "序号",
      align: "center",
      key: "index",
      width: 80,
      render: (_: any, __: any, index: number) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "日志编号",
      align: "center",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    { title: "操作模块", align: "center", dataIndex: "module", key: "module" },
    {
      title: "操作类型",
      align: "center",
      dataIndex: "action",
      key: "action",
      render: (action: string) => {
        const colors: any = {
          UPDATE: "blue",
          DELETE: "red",
          CREATE: "green",
          POST: "orange",
        };
        return <Tag color={colors[action]}>{action}</Tag>;
      },
    },
    {
      title: "操作描述",
      align: "center",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "操作人",
      align: "center",
      dataIndex: "operator",
      key: "operator",
    },
    {
      title: "终端地址",
      align: "center",
      render: (_: any, record: any) => (
        <Space orientation="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>{record.ip}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.location}
          </Text>
        </Space>
      ),
    },
    {
      title: "状态",
      align: "center",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={status === "success" ? "processing" : "error"}
          variant="filled"
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "操作时间",
      align: "center",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
    },
    {
      title: "操作",
      align: "center",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<InfoCircleOutlined />}
          onClick={() => {
            setSelectedLog(record);
            setIsModalOpen(true);
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 搜索区域 */}
      <Card
        variant="borderless"
        style={{
          borderRadius: 24,
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Form form={form} layout="inline">
          <Space wrap>
            <Form.Item label="操作人" name="username">
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item label="模块" name="moduleName">
              <Input placeholder="请输入模块名称" />
            </Form.Item>
            <Form.Item label="日期" name="date">
              <RangePicker format="YYYY/MM/DD" />
            </Form.Item>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => fetchData()}
            >
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                form.resetFields();
                fetchData(1, 10);
              }}
            >
              重置
            </Button>
          </Space>
        </Form>
      </Card>

      {/* 数据列表 */}
      <Card
        variant="borderless"
        style={{
          borderRadius: 32,
          background: "rgba(255,255,255,0.8)",
          border: "1px solid #fff",
        }}
        title={
          <Space>
            <MonitorOutlined />
            系统操作日志
          </Space>
        }
      >
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
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              fetchData(page, pageSize);
            },
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="日志详细详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        {selectedLog && (
          <Descriptions
            column={1}
            bordered
            size="small"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="请求描述">
              {selectedLog.description}
            </Descriptions.Item>
            <Descriptions.Item label="耗时">
              <Tag color="orange">{selectedLog.duration}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="请求参数">
              <pre
                style={{
                  background: "#f8fafc",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 12,
                  maxHeight: 550,
                  maxWidth: 750,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(JSON.parse(selectedLog.params), null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
