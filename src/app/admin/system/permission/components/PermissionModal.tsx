"use client";

import { Form, Input, InputNumber, message, Modal, Select } from "antd";
import React, { useEffect, useState } from "react";
import {
  addPermissionAction,
  updatePermissionAction,
} from "@/actions/permission.action";

interface PermissionNode {
  id: string;
}

interface Props {
  isModalOpen: boolean;
  editingItem: PermissionNode | null;
  parentId: string | null;
  parentPath: string | null;
  onClose: () => void;
  onSuccessCallback: () => void;
}

const PermissionModal = ({
  isModalOpen,
  editingItem,
  onClose,
  parentId,
  parentPath,
  onSuccessCallback,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isModalOpen) {
      form.resetFields();
      if (editingItem) {
        form.setFieldsValue(editingItem);
      } else {
        form.setFieldsValue(null);
      }
      if (parentId) {
        form.setFieldsValue({ parentId: parentId, parentPath: parentPath });
      }
    }
  }, [isModalOpen]);

  const onSubmit = async () => {
    await form.validateFields();

    try {
      setLoading(true);
      const { type, name, code, icon, sort, parentId, parentPath, path } =
        form.getFieldsValue();
      let result: any = null;
      const params = {
        type,
        name,
        code,
        icon,
        sort,
        parentId,
        parentPath,
        path,
      };
      const isEditMode = !!editingItem;
      if (isEditMode) {
        result = await updatePermissionAction({
          ...params,
          id: editingItem?.id,
        });
      } else {
        result = await addPermissionAction(params);
      }
      if (result.success) {
        message.success(`${isEditMode ? "更新" : "新增"}成功`);
        onSuccessCallback();
      } else {
        message.error(result.error || `${isEditMode ? "更新" : "新增"}失败`);
      }
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={parentId ? "添加子项" : editingItem ? "编辑权限" : "新增权限"}
      open={isModalOpen}
      onCancel={onClose}
      onOk={onSubmit}
      width={500}
      loading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="parentId"
          label="上级权限标识"
          rules={[{ required: true, message: "上级权限不能为空" }]}
        >
          <Input disabled placeholder="顶级权限无需填写" />
        </Form.Item>

        <Form.Item
          name="type"
          label="权限类型"
          rules={[{ required: true, message: "请选择权限类型" }]}
          initialValue={"menu"}
        >
          <Select placeholder="请选择权限类型">
            <Select.Option value="menu">菜单/模块</Select.Option>
            <Select.Option value="button">功能/按钮</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="权限名称"
          rules={[{ required: true, message: "权限名称不能为空" }]}
        >
          <Input placeholder="例如: 编辑文章" />
        </Form.Item>

        <Form.Item
          name="code"
          label="权限标识 (Code)"
          rules={[{ required: true, message: "权限标识不能为空" }]}
        >
          <Input placeholder="例如: content:edit" />
        </Form.Item>

        <Form.Item noStyle dependencies={["type"]}>
          {({ getFieldValue }) => {
            const type = getFieldValue("type");
            return type === "menu" ? (
              <Form.Item
                name="parentPath"
                label="上级菜单路径"
                rules={[{ required: true, message: "上级菜单路径不能为空" }]}
              >
                <Input placeholder="上级路径无需填写" disabled />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item noStyle dependencies={["type"]}>
          {({ getFieldValue }) => {
            const type = getFieldValue("type");
            return type === "menu" ? (
              <Form.Item
                name="path"
                label="菜单路径"
                rules={[
                  { required: true, message: "菜单路径不能为空" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      if (!value.startsWith("/admin")) {
                        return Promise.reject(
                          new Error("菜单路径必须以 /admin 开头"),
                        );
                      }
                      const pathPart = value.substring(6); // 从 /admin 后开始，所以是6位
                      if (!/^\/[a-zA-Z][a-zA-Z0-9_/-]*$/.test(pathPart)) {
                        return Promise.reject(
                          new Error(
                            "路径部分只能包含英文字母、数字、下划线、连字符和斜杠",
                          ),
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="例如: /admin/contents/list" />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item noStyle dependencies={["type"]}>
          {({ getFieldValue }) => {
            const type = getFieldValue("type");
            return type === "menu" ? (
              <Form.Item name="sort" label="显示排序" initialValue={1}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PermissionModal;
