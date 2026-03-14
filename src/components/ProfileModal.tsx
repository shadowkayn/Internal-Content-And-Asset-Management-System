"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, message, Modal, Tabs } from "antd";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ImageUpload from "@/components/common/ImageUpload";
import { updateProfileAction, updatePasswordAction } from "@/actions/user.actions";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const userInfo = useCurrentUser();

  const phoneRegex =
    /^(\+?86[-\s]?)?1[3-9]\d{9}$|^(\+?86[-\s]?)?0\d{2,3}[-\s]?\d{7,8}$|^\+[\d\s\-\(\)]{8,15}$/;

  useEffect(() => {
    if (open && userInfo) {
      profileForm.setFieldsValue({
        nickname: userInfo.nickname,
        email: userInfo.email,
        phone: userInfo.phone,
        avatar: userInfo.avatar,
      });
    }
  }, [open, userInfo]);

  // 更新个人资料
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const values = await profileForm.validateFields();
      const res = await updateProfileAction(values);

      if (res.success) {
        message.success("个人资料更新成功");
        // 刷新页面以更新用户信息
        window.location.reload();
      } else {
        message.error(res.error || "更新失败");
      }
    } catch (errorInfo: any) {
      if (errorInfo.errorFields) {
        message.error("请检查表单填写是否完整或正确");
      } else {
        message.error(errorInfo.message || "操作失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      const values = await passwordForm.validateFields();
      const res = await updatePasswordAction(values);

      if (res.success) {
        message.success("密码修改成功，请重新登录");
        passwordForm.resetFields();
        // 延迟跳转到登录页
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 1500);
      } else {
        message.error(res.error || "修改失败");
      }
    } catch (errorInfo: any) {
      if (errorInfo.errorFields) {
        message.error("请检查表单填写是否完整或正确");
      } else {
        message.error(errorInfo.message || "操作失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: "profile",
      label: "个人资料",
      children: (
        <Form form={profileForm} layout="vertical">
          <Form.Item label="头像" name="avatar">
            <ImageUpload
              onChange={(url) => profileForm.setFieldsValue({ avatar: url })}
            />
          </Form.Item>
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
        </Form>
      ),
    },
    {
      key: "password",
      label: "修改密码",
      children: (
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="当前密码"
            name="oldPassword"
            rules={[{ required: true, message: "请输入当前密码" }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码长度不能小于6位" },
            ]}
          >
            <Input.Password placeholder="请输入新密码（至少6位）" />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      ),
    },
  ];

  const [activeTab, setActiveTab] = useState("profile");

  const handleOk = () => {
    if (activeTab === "profile") {
      handleUpdateProfile();
    } else {
      handleUpdatePassword();
    }
  };

  const handleCancel = () => {
    profileForm.resetFields();
    passwordForm.resetFields();
    setActiveTab("profile");
    onClose();
  };

  return (
    <Modal
      title="个人设置"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText={activeTab === "profile" ? "保存" : "修改密码"}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
}
