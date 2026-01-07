import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  message,
  Modal,
  Select,
  Switch,
  Upload,
  UploadProps,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { addUserAction, updateUserAction } from "@/actions/user.actions";

interface UserModalProps {
  open: boolean;
  isEditMode: boolean;
  initialData?: any;
  onClose: () => void;
  onSuccessCallback: () => void;
}

const getBase64 = (img: any, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: any) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

export default function UserModal({
  open,
  isEditMode,
  initialData,
  onClose,
  onSuccessCallback,
}: UserModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  const phoneRegex =
    /^(\+?86[-\s]?)?1[3-9]\d{9}$|^(\+?86[-\s]?)?0\d{2,3}[-\s]?\d{7,8}$|^\+[\d\s\-\(\)]{8,15}$/;

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (isEditMode && initialData) {
        form.setFieldsValue({
          ...initialData,
          status: initialData.status === "active",
        });
      } else {
        form.setFieldsValue({ status: true });
      }
    }
  }, [open, isEditMode, initialData, form]);

  // submit
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const params = {
        ...values,
        id: initialData?.id,
        status: values.status ? "active" : "disabled",
      };
      let res;
      if (isEditMode) {
        res = await updateUserAction(params);
      } else {
        res = await addUserAction(params);
      }
      if (res.success) {
        message.success(isEditMode ? "更新成功" : "新增成功");
        onSuccessCallback();
      } else {
        message.error(res.error || (isEditMode ? "更新失败" : "新增失败"));
      }
    } catch (errorInfo: any) {
      if (errorInfo.errorFields) {
        message.error("请检查表单填写是否完整或正确。");
      } else {
        message.error(errorInfo.message || "操作失败，请重试。");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setUploadLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as any, (url: string) => {
        setUploadLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Modal
      title={isEditMode ? "编辑用户" : "新增用户"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      forceRender // 确保表单项在modal关闭时不会被销毁，以便useEffect能正确设置值
    >
      <Form
        form={form}
        layout="vertical"
        name="user_form"
        initialValues={initialData}
        style={{
          maxHeight: "calc(100vh - 300px)",
          overflowY: "auto",
          padding: 12,
        }}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input placeholder="请输入用户名" disabled={isEditMode} />
        </Form.Item>
        {!isEditMode && (
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input placeholder="请输入密码" type="password" />
          </Form.Item>
        )}
        <Form.Item
          label="昵称"
          name="nickname"
          rules={[{ required: true, message: "请输入昵称" }]}
        >
          <Input placeholder="请输入昵称" />
        </Form.Item>
        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, type: "email", message: "请输入有效的邮箱" },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="联系电话"
          rules={[
            { required: true, message: "请输入联系电话" },
            { pattern: phoneRegex, message: "请输入正确的手机号码" },
          ]}
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>
        <Form.Item
          name="role"
          label="角色"
          rules={[{ required: true, message: "请选择用户角色!" }]}
        >
          <Select placeholder="请选择角色">
            <Select.Option value="admin">管理员</Select.Option>
            <Select.Option value="editor">编辑员</Select.Option>
            <Select.Option value="viewer">普通用户</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="状态" name="status" valuePropName="checked">
          <Switch checkedChildren="正常" unCheckedChildren="禁用" />
        </Form.Item>
        <Form.Item label="头像" name="avatar">
          <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
            beforeUpload={beforeUpload}
            onChange={handleChange}
          >
            {imageUrl ? (
              <img
                draggable={false}
                src={imageUrl}
                alt="avatar"
                style={{ width: "100%" }}
              />
            ) : (
              uploadButton
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
