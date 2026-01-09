import { Form, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import CommonSelect from "@/components/common/CommonSelect";
import {
  createContentAction,
  updateContentAction,
} from "@/actions/content.actions";

interface ContentItem {
  id?: string;
  title: string;
  content: string;
  category: string;
  status: string;
  cover: string;
}

interface ContentModalProps {
  isModalOpen: boolean;
  isEditMode: boolean;
  editItem: ContentItem | null;
  onClose: () => void;
  onSuccessCallback: () => void;
}

export default function ContentModal({
  isModalOpen,
  isEditMode,
  editItem,
  onClose,
  onSuccessCallback,
}: ContentModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      form.resetFields();
      if (isEditMode && editItem) {
        form.setFieldsValue(editItem);
      } else {
        form.setFieldsValue(null);
      }
    }
  }, [editItem, form, isEditMode, isModalOpen]);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      let res;
      if (isEditMode) {
        const params = {
          ...values,
          id: editItem?.id,
        };
        console.log("params", params);
        res = await updateContentAction(params);
      } else {
        res = await createContentAction(values);
      }
      if (res.success) {
        message.success(isEditMode ? "更新成功" : "新增成功");
        onSuccessCallback();
      } else {
        message.error(res.error || (isEditMode ? "更新失败" : "新增失败"));
      }
    } catch (e: any) {
      if (e.errorFields) {
        message.error("请检查表单填写是否完整或正确。");
      } else {
        message.error(e.message || "操作失败，请重试。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "编辑内容" : "新增内容"}
      confirmLoading={loading}
      open={isModalOpen}
      onOk={onSubmit}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="内容标题"
          name="title"
          rules={[{ required: true, message: "请输入标题" }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>
        <Form.Item label="内容封面" name="cover">
          <Input placeholder="内容封面" />
        </Form.Item>
        <Form.Item
          label="内容分类"
          name="category"
          rules={[{ required: true, message: "请选择分类" }]}
        >
          <CommonSelect
            dictCode="sys_content_category"
            placeholder="请选择分类"
          />
        </Form.Item>
        <Form.Item
          label="内容状态"
          name="status"
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <CommonSelect
            dictCode="sys_content_status"
            placeholder="请选择状态"
          />
        </Form.Item>
        <Form.Item
          label="内容摘要"
          name="content"
          rules={[{ required: true, message: "请输入摘要" }]}
        >
          <Input.TextArea rows={4} placeholder="请输入摘要..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
