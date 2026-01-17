"use client";

import React, { useEffect, useState } from "react";
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
import { getPermissionListAction } from "@/actions/permission.action";
import { createRoleAction, editRoleAction } from "@/actions/role.action";

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
  const [permissionTree, setPermissionTree] = useState<any[]>([]);

  useEffect(() => {
    if (isModalOpen) {
      getPermissionTreeData().then();
      form.resetFields();
      setCheckedKeys([]);

      if (editingRole) {
        form.setFieldsValue({
          ...editingRole,
          status: editingRole.status === "active",
        });
        setCheckedKeys(editingRole?.permissions || []);
      } else {
        form.setFieldsValue(null);
      }
    }
  }, [isModalOpen]);

  const getPermissionTreeData = async () => {
    try {
      setLoading(true);
      const res: any = await getPermissionListAction();
      if (res.success) {
        const treeData = convertPermissionData(res.data?.list || []);
        setPermissionTree(treeData);
      } else {
        message.error(res.message || "获取权限树失败");
      }
    } catch (e: any) {
      message.error(e.message || "获取权限树失败");
    } finally {
      setLoading(false);
    }
  };

  // 转换权限数据为 Tree 组件所需格式
  const convertPermissionData: any = (permissions: any[]) => {
    return permissions.map((permission) => ({
      title: permission.name,
      key: permission.code,
      children: permission.children
        ? convertPermissionData(permission.children)
        : [],
    }));
  };

  const onSubmit = async () => {
    await form.validateFields();

    const isEditMode = !!editingRole;
    const action = isEditMode ? "更新" : "新增";
    try {
      setLoading(true);
      const { name, code, status, description } = form.getFieldsValue();
      const params = {
        name,
        code,
        status: status ? "active" : "disabled",
        description,
        permissions: checkedKeys,
      };

      let res: any = null;
      if (isEditMode) {
        res = await editRoleAction({
          ...params,
          id: editingRole?.id,
        });
      } else {
        res = await createRoleAction(params);
      }

      if (res.success) {
        message.success(`${action}成功`);
        onSuccessCallback();
      } else {
        message.error(res.error || `${action}失败`);
      }
    } catch (e: any) {
      message.error(e.message || `${action}失败`);
    } finally {
      setLoading(false);
    }
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
              initialValue={true}
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
            <Form.Item
              name="description"
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
                maxHeight: "500px",
                overflowY: "auto",
                border: "1px solid #f1f5f9",
              }}
            >
              <Tree
                checkable
                defaultExpandAll
                onCheck={(keys) => setCheckedKeys(keys as string[])}
                checkedKeys={checkedKeys}
                treeData={permissionTree}
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
