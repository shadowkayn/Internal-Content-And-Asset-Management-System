"use client";

import React, { useState } from "react";
import {
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Switch,
  Tree,
  Typography,
} from "antd";

interface Props {
  isModalOpen: boolean;
  editingRole: any;
  onClose: () => void;
  onSuccessCallback: () => void;
}

const RoleModal = ({
  isModalOpen,
  editingRole,
  onClose,
  onSuccessCallback,
}: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  // 定义系统所有的权限树（这部分通常可以放在 constants 中）
  const permissionData = [
    {
      title: "仪表盘",
      key: "dashboard",
      children: [{ title: "查看数据", key: "dashboard:view" }],
    },
    {
      title: "内容管理",
      key: "content",
      children: [
        { title: "内容列表", key: "content:list" },
        { title: "内容预览", key: "content:preview" },
        { title: "内容新增", key: "content:add" },
        { title: "内容编辑", key: "content:edit" },
        { title: "内容删除", key: "content:delete" },
      ],
    },
    {
      title: "用户管理",
      key: "user",
      children: [
        { title: "用户列表", key: "user:list" },
        { title: "用户编辑", key: "user:edit" },
        { title: "角色管理", key: "user:role" },
      ],
    },
    {
      title: "系统管理",
      key: "system",
      children: [
        { title: "字典管理", key: "system:dict" },
        { title: "系统日志", key: "system:log" },
      ],
    },
  ];

  const onSubmit = () => {
    setLoading(true);
    onSuccessCallback();
    setLoading(false);
  };

  return (
    <Modal
      title={editingRole ? "编辑角色权限" : "新增角色"}
      open={isModalOpen}
      onCancel={onClose}
      onOk={onSubmit}
      width={1000}
      loading={loading}
      styles={{ body: { padding: "20px 24px" } }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          {/* 左侧基本信息 */}
          <Col span={12}>
            <Divider
              orientation="horizontal"
              style={{ marginTop: 0 }}
              titlePlacement="left"
            >
              基本信息
            </Divider>
            <Form.Item
              name="name"
              label="角色名称"
              rules={[{ required: true, message: "角色名称不能为空" }]}
            >
              <Input
                placeholder="请输入角色名称..."
                maxLength={10}
                count={{
                  show: true,
                  max: 10,
                }}
              />
            </Form.Item>
            <Form.Item
              name="code"
              label="角色标识"
              rules={[{ required: true, message: "角色标识不能为空" }]}
            >
              <Input placeholder="例如: editor" />
            </Form.Item>
            <Form.Item
              label="状态"
              name="status"
              valuePropName="checked"
              rules={[{ required: true }]}
            >
              <Switch checkedChildren="正常" unCheckedChildren="禁用" />
            </Form.Item>
            <Form.Item
              name="desc"
              label="角色描述"
              rules={[{ required: true, message: "角色描述不能为空" }]}
            >
              <Input.TextArea rows={5} placeholder="请输入角色描述..." />
            </Form.Item>
          </Col>

          {/* 右侧权限分配 */}
          <Col span={12}>
            <Divider
              orientation="horizontal"
              style={{ marginTop: 0 }}
              titlePlacement="left"
            >
              功能权限分配
            </Divider>
            <div
              style={{
                background: "#f8fafc",
                padding: "12px",
                borderRadius: "12px",
                maxHeight: "600px",
                overflowY: "auto",
                border: "1px solid #f1f5f9",
              }}
            >
              <Tree
                checkable
                defaultExpandAll
                onCheck={(keys) => setCheckedKeys(keys as string[])}
                checkedKeys={checkedKeys}
                treeData={permissionData}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                已选择 {checkedKeys.length} 个权限点
              </Typography.Text>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default RoleModal;
