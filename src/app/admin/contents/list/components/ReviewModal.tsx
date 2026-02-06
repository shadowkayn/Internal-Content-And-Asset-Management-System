import { Button, Form, Input, message, Modal, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { reviewContentAction } from "@/actions/content.actions";

const { Text, Paragraph } = Typography;

interface ReviewModalProps {
  isOpen: boolean;
  content: {
    id: string;
    title: string;
    author: { nickname: string };
    createdAt: string;
    description: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  isOpen,
  content,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      setAction(null);
    }
  }, [isOpen, form]);

  const handleSubmit = async (selectedAction: "approved" | "rejected") => {
    try {
      setLoading(true);
      setAction(selectedAction);

      // 如果是驳回操作，验证原因字段
      if (selectedAction === "rejected") {
        await form.validateFields();
      }

      const values = form.getFieldsValue();

      const res = await reviewContentAction({
        contentId: content?.id,
        action: selectedAction,
        reason: values.reason,
      });

      if (res.success) {
        message.success(selectedAction === "approved" ? "审核通过" : "已驳回");
        onSuccess();
      } else {
        message.error(res.error);
      }
    } catch (e: any) {
      if (e.errorFields) {
        message.error("请填写驳回原因");
      } else {
        message.error(e.message || "操作失败");
      }
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  return (
    <Modal
      title="审核文章"
      open={isOpen}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          取消
        </Button>,
        <Button
          key="reject"
          danger
          loading={loading && action === "rejected"}
          onClick={() => handleSubmit("rejected")}
        >
          驳回
        </Button>,
        <Button
          key="approve"
          type="primary"
          loading={loading && action === "approved"}
          onClick={() => handleSubmit("approved")}
        >
          通过
        </Button>,
      ]}
    >
      {content && (
        <>
          <Space
            orientation="vertical"
            style={{ width: "100%", marginBottom: 16 }}
          >
            <div>
              <Text strong>文章标题：</Text>
              <Text>{content.title}</Text>
            </div>
            <div>
              <Text strong>作者：</Text>
              <Text>{content.author.nickname}</Text>
            </div>
            <div>
              <Text strong>创建时间：</Text>
              <Text>{content.createdAt}</Text>
            </div>
            <div>
              <Text strong>内容摘要：</Text>
              <Paragraph
                ellipsis={{ rows: 3, expandable: true, symbol: "展开" }}
                style={{ marginBottom: 0 }}
              >
                {content.description}
              </Paragraph>
            </div>
          </Space>

          <Form form={form} layout="vertical">
            <Form.Item
              name="reason"
              label="驳回原因"
              rules={[
                {
                  required: action === "rejected",
                  message: "驳回时必须填写原因",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="请填写驳回原因（驳回时必填）"
              />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}
