"use client";

import {
  Layout,
  Avatar,
  Space,
  Badge,
  Breadcrumb,
  Dropdown,
  MenuProps,
} from "antd";
import {
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { SidebarMenu } from "@/components/SidebarMenu";
import React, { useState } from "react";

const { Header, Content, Footer, Sider } = Layout;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // 用户下拉菜单
  const userMenuItems: MenuProps["items"] = [
    { key: "profile", label: "个人设置", icon: <SettingOutlined /> },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        theme="light"
        width={220}
        style={{
          boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: "bold",
            color: "#1890ff",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {collapsed ? "K" : "KAYN ADMIN"}
        </div>
        <SidebarMenu />
      </Sider>

      <Layout style={{ background: "#f5f7f9" }}>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
            zIndex: 9,
          }}
        >
          <Breadcrumb items={[{ title: "后台管理" }, { title: "仪表盘" }]} />

          <Space size={20}>
            <Badge count={5} dot>
              <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <span style={{ fontWeight: 500 }}>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            borderRadius: 8,
            minHeight: 280,
            transition: "all 0.3s",
          }}
        >
          {children}
        </Content>

        <Footer
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#999",
            padding: "0 0 24px 0",
            background: "transparent",
          }}
        >
          {`System Design ©${new Date().getFullYear()} Created by KAYN`}
        </Footer>
      </Layout>
    </Layout>
  );
}
