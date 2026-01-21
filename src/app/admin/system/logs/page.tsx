"use client";

import React, { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Modal,
  Descriptions,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  MonitorOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function SystemLogsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // 模拟数据
  const mockLogs = [
    {
      id: "1",
      module: "内容管理",
      action: "UPDATE",
      desc: "修改文章详情",
      operator: "超级管理员",
      ip: "192.168.1.105",
      location: "北京-海淀",
      status: "success",
      duration: "120ms",
      createTime: "2026-01-20 14:22:15",
      params: '{"id": "123", "title": "新标题", "status": "published"}',
    },
    {
      id: "2",
      module: "用户管理",
      action: "DELETE",
      desc: "删除用户",
      operator: "凯隐",
      ip: "110.12.33.45",
      location: "广东-深圳",
      status: "fail",
      duration: "45ms",
      createTime: "2026-01-20 12:05:00",
      params: '{"userId": "999"}',
    },
  ];

  const columns = [
    { title: "日志编号", dataIndex: "id", key: "id", width: 100 },
    { title: "操作模块", dataIndex: "module", key: "module" },
    {
      title: "操作类型",
      dataIndex: "action",
      key: "action",
      render: (action: string) => {
        const colors: any = { UPDATE: "blue", DELETE: "red", CREATE: "green" };
        return (
          <Tag color={colors[action]} bordered={false}>
            {action}
          </Tag>
        );
      },
    },
    { title: "操作描述", dataIndex: "desc", key: "desc" },
    { title: "操作人", dataIndex: "operator", key: "operator" },
    {
      title: "终端地址",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>{record.ip}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.location}
          </Text>
        </Space>
      ),
    },
    {
      title: "状态",
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
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
    },
    {
      title: "操作",
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
        <Form layout="inline">
          <Space wrap>
            <Form.Item label="操作人">
              <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item label="模块">
              <Select
                placeholder="全部"
                style={{ width: 120 }}
                options={[{ label: "内容", value: "content" }]}
              />
            </Form.Item>
            <Form.Item label="日期">
              <RangePicker />
            </Form.Item>
            <Button type="primary" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />}>重置</Button>
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
        <Table columns={columns} dataSource={mockLogs} rowKey="id" />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="日志详细详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedLog && (
          <Descriptions
            column={1}
            bordered
            size="small"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="请求接口">
              {selectedLog.desc}
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
