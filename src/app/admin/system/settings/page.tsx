"use client";

import React, { useEffect, useState } from "react";
import {
  Tabs,
  Card,
  Form,
  Input,
  Switch,
  Button,
  Upload,
  message,
  Space,
  Typography,
  InputNumber,
  Divider,
  Skeleton,
  Modal,
} from "antd";
import {
  GlobalOutlined,
  LockOutlined,
  CloudUploadOutlined,
  ToolOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  getSystemConfigAction,
  saveSystemConfigAction,
  setDefaultSystemConfigAction,
} from "@/actions/systemSetting.action";

const { Title, Text } = Typography;

export default function SystemSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [modal, contextHolder] = Modal.useModal();

  const getSystemConfig = async () => {
    try {
      setLoading(true);
      const res = await getSystemConfigAction();
      if (res.success) {
        const values = res.data;
        setSystemConfig(values);
        setTimeout(() => {
          form.setFieldsValue(values);
        }, 0);
      } else {
        message.error(res.error || "获取配置失败");
      }
    } catch (e: any) {
      message.error(e.message || "获取配置失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSystemConfig().then();
  }, []);

  // 保存设置逻辑
  const onFinish = async (values: any) => {
    try {
      const params = {
        ...values,
        id: systemConfig?.id,
      };
      const res = await saveSystemConfigAction(params);

      if (res.success) {
        message.success("保存成功");
      } else {
        message.error(res.error || "保存失败");
      }
    } catch (e: any) {
      message.error(e.message || "保存失败");
    }
  };

  const onResetConfig = () => {
    modal.confirm({
      title: "确定要恢复到系统默认配置吗？",
      content: "恢复后编辑的相关配置将复原，请谨慎操作。",
      onOk: async () => {
        try {
          const res = await setDefaultSystemConfigAction();
          if (res.success) {
            message.success("重制配置成功");
            await getSystemConfig();
          } else {
            message.error(res.error || "操作失败");
          }
        } catch (e: any) {
          message.error(e.message || "操作失败");
        }
      },
      onCancel: () => {
        message.info("取消操作");
      },
    });
  };

  // 站点基本信息
  const GeneralSettings = () => (
    <>
      <Form.Item
        label="网站名称"
        name="siteName"
        extra="显示在浏览器标签和侧边栏顶部"
      >
        <Input placeholder="输入网站名称" maxLength={20} />
      </Form.Item>
      <Form.Item label="网站 Logo">
        <Upload listType="picture-card" maxCount={1}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item label="版权声明" name="copyright">
        <Input placeholder="输入版权文本" />
      </Form.Item>
    </>
  );

  // 安全访问控制
  const SecuritySettings = () => (
    <>
      <Form.Item
        label="允许新用户注册"
        name="allowRegister"
        valuePropName="checked"
      >
        <Switch checkedChildren="开启" unCheckedChildren="关闭" />
      </Form.Item>
      <Form.Item
        label="多设备登录拦截"
        name="multiLogin"
        valuePropName="checked"
      >
        <Switch checkedChildren="开启" unCheckedChildren="关闭" />
      </Form.Item>
      <Form.Item label="登录超时时间 (分钟)" name="loginOverTime">
        <InputNumber min={2} max={20} style={{ width: 200 }} />
      </Form.Item>
    </>
  );

  // 文件上传配置
  const UploadSettings = () => (
    <>
      <Form.Item label="文件上传限制 (MB)" name="fileSizeLimit">
        <InputNumber min={1} max={50} style={{ width: 200 }} />
      </Form.Item>
      <Form.Item label="存储地址" name="storePath">
        <Input.Group compact>
          <Input style={{ width: "20%" }} disabled defaultValue="当前:" />
          <Input
            style={{ width: "80%" }}
            placeholder="本地存储 (Local Storage)"
            disabled
          />
        </Input.Group>
      </Form.Item>
    </>
  );

  const tabItems = [
    {
      key: "1",
      label: (
        <Space>
          <GlobalOutlined />
          站点信息
        </Space>
      ),
      children: <GeneralSettings />,
    },
    {
      key: "2",
      label: (
        <Space>
          <LockOutlined />
          安全配置
        </Space>
      ),
      children: <SecuritySettings />,
    },
    {
      key: "3",
      label: (
        <Space>
          <CloudUploadOutlined />
          存储设置
        </Space>
      ),
      children: <UploadSettings />,
    },
    {
      key: "4",
      label: (
        <Space>
          <ToolOutlined />
          高级运维
        </Space>
      ),
      children: (
        <div style={{ padding: "20px 0" }}>
          <Title level={5}>系统维护</Title>
          <Text type="secondary">
            开启维护模式后，非管理员用户将无法进入后台系统。
          </Text>
          <div style={{ marginTop: 16 }}>
            <Button danger ghost>
              立即进入维护模式
            </Button>
            <Button style={{ marginLeft: 12 }}>清空系统缓存</Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1500, margin: "0 auto" }}>
      {contextHolder}
      <div style={{ marginBottom: 32 }}>
        <Title
          level={3}
          style={{
            fontWeight: 800,
            background: "linear-gradient(to bottom, #af87f1, #b96ddf)", // 上下渐变
            WebkitBackgroundClip: "text", // 背景裁剪为文字
            WebkitTextFillColor: "transparent", // 文字透明显示背景
            marginBottom: 10,
            fontStyle: "italic",
          }}
        >
          SYSTEM SETTINGS
        </Title>
        <Text type="secondary" style={{ color: "#46aadf" }}>
          配置系统的核心参数，修改后将影响全站运行状态。
        </Text>
      </div>

      <Card
        loading={loading}
        style={{
          borderRadius: "32px",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 50px rgba(147, 197, 253, 0.1)",
        }}
      >
        <Form form={form} onFinish={onFinish}>
          <Tabs
            defaultActiveKey="1"
            items={tabItems}
            tabPlacement="start"
            style={{ minHeight: 400 }}
          />

          <Divider />

          <div style={{ textAlign: "right" }}>
            <Space size="large">
              <Button size="large" onClick={onResetConfig}>
                恢复默认
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={() => form.submit()}
                style={{
                  borderRadius: "12px",
                  padding: "0 40px",
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                  border: "none",
                  boxShadow: "0 10px 20px rgba(99, 102, 241, 0.2)",
                }}
              >
                保存全局配置
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
