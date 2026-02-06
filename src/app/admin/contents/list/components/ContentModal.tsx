import { Form, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import CommonSelect from "@/components/common/CommonSelect";
import {
  createContentAction,
  updateContentAction,
} from "@/actions/content.actions";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/common/ImageUpload";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// 禁用 SSR
const RichTextEditor = dynamic(
  () => import("@/components/common/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 200, background: "#f5f5f5", borderRadius: 12 }} />
    ),
  },
);

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
  initValues?: ContentItem | null;
  showMessage?: boolean;
  onClose: () => void;
  onSuccessCallback: () => void;
}

export default function ContentModal({
  isModalOpen,
  isEditMode,
  editItem,
  onClose,
  onSuccessCallback,
  initValues = null,
  showMessage = true,
}: ContentModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const userInfo = useCurrentUser();
  const isAdmin = userInfo?.role === "admin";

  useEffect(() => {
    if (isModalOpen) {
      form.resetFields();
      if (isEditMode && editItem) {
        form.setFieldsValue(editItem);
      } else {
        form.setFieldsValue(initValues);
      }
    }
  }, [isModalOpen]);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // 如果不是管理员，添加默认状态为 draft
      if (!isAdmin && !isEditMode) {
        values.status = "draft";
      }

      let res;
      if (isEditMode) {
        const params = {
          status: editItem?.status,
          ...values,
          id: editItem?.id,
        };
        res = await updateContentAction(params);
      } else {
        res = await createContentAction(values);
      }
      if (res.success) {
        if (showMessage) {
          message.success(isEditMode ? "更新成功" : "新增成功");
        }
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
      destroyOnHidden
      width={800}
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
          <ImageUpload
            onChange={(value) => form.setFieldsValue({ cover: value })}
          />
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
        {/* 只有管理员才显示状态选择器 */}
        {isAdmin && (
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
        )}
        <Form.Item
          label="内容描述"
          name="description"
          rules={[{ required: true, message: "请输入描述" }]}
        >
          <Input.TextArea rows={4} placeholder="请输入描述..." />
        </Form.Item>
        <Form.Item
          label="内容正文"
          name="content"
          rules={[{ required: true, message: "请输入正文" }]}
        >
          <RichTextEditor />
        </Form.Item>
      </Form>

      <style jsx global>{`
        .ant-modal-body {
          max-height: 600px;
          overflow-y: auto;
        }
      `}</style>
    </Modal>
  );
}
