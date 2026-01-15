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
  onClose: () => void;
  onSuccessCallback: () => void;
}

const RootPermissionModal = ({
  isModalOpen,
  editingItem,
  onClose,
  onSuccessCallback,
}: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      form.resetFields();
      if (editingItem) {
        form.setFieldsValue(editingItem);
      } else {
        form.setFieldsValue(null);
      }
    }
  }, [isModalOpen]);

  const onSubmit = async () => {
    await form.validateFields();

    try {
      setLoading(true);
      const { type, name, code, icon, sort, parentId } = form.getFieldsValue();
      let res: any = null;
      const params = {
        type,
        name,
        code,
        icon,
        sort,
        parentId,
      };
      const isEditMode = !!editingItem;
      if (isEditMode) {
        res = await updatePermissionAction({ ...params, id: editingItem?.id });
      } else {
        res = await addPermissionAction(params);
      }
      if (res.success) {
        message.success(`${isEditMode ? "更新" : "新增"}成功`);
        onSuccessCallback();
      } else {
        message.error(res.error || `${isEditMode ? "更新" : "新增"}失败`);
      }
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingItem ? "编辑根权限" : "新增根权限"}
      open={isModalOpen}
      onCancel={onClose}
      onOk={onSubmit}
      loading={loading}
      width={500}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="type" label="权限类型" initialValue={"menu"}>
          <Select disabled>
            <Select.Option value="menu">菜单/模块</Select.Option>
            <Select.Option value="button">功能/按钮</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="菜单名称"
          rules={[{ required: true, message: "菜单名称不能为空" }]}
        >
          <Input placeholder="例如: 内容管理" />
        </Form.Item>

        <Form.Item
          name="code"
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
                const pathPart = value.substring(6);
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
          <Input placeholder="例如: /admin/contents" />
        </Form.Item>

        <Form.Item name="icon" label="菜单图标" initialValue="MenuOutlined">
          <Input placeholder="例如: MenuOutlined" />
        </Form.Item>

        <Form.Item name="sort" label="显示排序" initialValue={1}>
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RootPermissionModal;
