"use client";

import {
  Layout,
  Avatar,
  Space,
  Badge,
  Breadcrumb,
  Dropdown,
  MenuProps,
  message,
} from "antd";
import {
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { SidebarMenu } from "@/components/SidebarMenu";
import React, { useState } from "react";
import { logout } from "@/actions/auth.actions";
import { usePathname, useRouter } from "next/dist/client/components/navigation";
import { MenuConfig } from "@/constants/menu";

const { Header, Content, Footer, Sider } = Layout;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      logout().then(() => {
        router.replace("/auth/login");
        message.success("退出登录成功");
      });
    }
  };

  // 面包屑
  const getBreadcrumbItems = () => {
    const items = [{ title: "首页" }]; // 默认根节点

    const findPathItems = (
      menuData: any[],
      targetKey: string,
      parents: any[] = [],
    ): any[] | null => {
      for (const item of menuData) {
        if (item.key === targetKey) {
          return [...parents, item];
        }
        if (item.children) {
          const result = findPathItems(item.children, targetKey, [
            ...parents,
            item,
          ]);
          if (result) return result;
        }
      }
      return null;
    };

    const matchedItems = findPathItems(MenuConfig, pathname);

    if (matchedItems) {
      matchedItems.forEach((item) => {
        items.push({ title: item.label });
      });
    } else if (pathname !== "/") {
      // 兼容一些不在菜单里的页面，比如 /dashboard
      const labelMap: Record<string, string> = { "/dashboard": "仪表盘" };
      if (labelMap[pathname]) {
        items.push({ title: labelMap[pathname] });
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

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
          <Breadcrumb items={breadcrumbItems} />

          <Space size={20}>
            <Badge count={5} dot>
              <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} />
            </Badge>
            <Dropdown
              menu={{ items: userMenuItems, onClick }}
              placement="bottomRight"
            >
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
