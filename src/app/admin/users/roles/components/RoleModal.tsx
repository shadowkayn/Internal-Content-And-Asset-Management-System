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
  const [flatPermissions, setFlatPermissions] = useState<any[]>([]); // 扁平化的权限列表

  useEffect(() => {
    if (isModalOpen) {
      form.resetFields();
      setCheckedKeys([]);

      // 先加载权限树
      getPermissionTreeData().then(() => {
        // 权限树加载完成后再设置表单数据
        if (editingRole) {
          form.setFieldsValue({
            ...editingRole,
            status: editingRole.status === "active",
          });
        } else {
          form.setFieldsValue(null);
        }
      });
    }
  }, [isModalOpen]);

  // 监听 flatPermissions 和 editingRole 的变化，当权限数据加载完成后设置勾选状态
  useEffect(() => {
    if (isModalOpen && editingRole && flatPermissions.length > 0) {
      const filteredKeys = filterParentKeys(editingRole?.permissions || []);
      setCheckedKeys(filteredKeys);
    }
  }, [flatPermissions, isModalOpen]);

  const getPermissionTreeData = async () => {
    try {
      setLoading(true);
      const res: any = await getPermissionListAction();
      if (res.success) {
        const permissions = res.data?.list || [];
        // 扁平化权限数据
        const flat = flattenPermissions(permissions);
        setFlatPermissions(flat);
        const treeData = convertPermissionData(permissions);
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

  // 扁平化权限树
  const flattenPermissions = (permissions: any[]): any[] => {
    const result: any[] = [];
    const flatten = (perms: any[]) => {
      perms.forEach((perm) => {
        result.push(perm);
        if (perm.children && perm.children.length > 0) {
          flatten(perm.children);
        }
      });
    };
    flatten(permissions);
    return result;
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

  // 添加所有父级权限（仅在提交时使用）
  const addParentCodes = (codes: string[]): string[] => {
    const result = new Set<string>(codes);

    codes.forEach((code) => {
      // 找到当前权限
      const current = flatPermissions.find((p) => p.code === code);
      if (current && current.parentId) {
        // 找到父级权限
        const parent = flatPermissions.find((p) => p.code === current.parentId);
        if (parent) {
          result.add(parent.code);
          // 递归添加父级的父级
          const parentCodes = addParentCodes([parent.code]);
          parentCodes.forEach((pc) => result.add(pc));
        }
      }
    });

    return Array.from(result);
  };

  // 过滤父节点：如果父节点的所有子节点都被选中，保留父节点；否则移除父节点，只保留子节点
  const filterParentKeys = (codes: string[]): string[] => {
    const result = new Set<string>(codes);

    codes.forEach((code) => {
      const current = flatPermissions.find((p) => p.code === code);
      if (current) {
        // 找到该节点的所有子节点
        const children = flatPermissions.filter(
          (p) => p.parentId === current.code,
        );

        if (children.length > 0) {
          // 检查是否所有子节点都被选中
          const allChildrenSelected = children.every((child) =>
            codes.includes(child.code),
          );

          // 如果不是所有子节点都被选中，移除父节点
          if (!allChildrenSelected) {
            result.delete(code);
          }
        }
      }
    });

    return Array.from(result);
  };

  const onSubmit = async () => {
    await form.validateFields();

    const isEditMode = !!editingRole;
    const action = isEditMode ? "更新" : "新增";
    try {
      setLoading(true);
      const { name, code, status, description } = form.getFieldsValue();

      // 在提交时自动添加父级权限
      const finalPermissions = addParentCodes(checkedKeys);

      const params = {
        name,
        code,
        status: status ? "active" : "disabled",
        description,
        permissions: finalPermissions,
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
