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
    <Layout
      style={{
        background:
          "linear-gradient(135deg, #f5f7ff 0%, #fff1f2 50%, #f0fdf4 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        theme="light"
        width={220}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.3)", // 极高透明度
          backdropFilter: "blur(30px)",
          borderRight: "none",
          boxShadow: "10px 0 30px rgba(0,0,0,0.01)",
          position: "sticky",
          top: 0,
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
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            backgroundImage:
              "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          {collapsed ? "K" : "KAYN ADMIN"}
        </div>
        <SidebarMenu />
      </Sider>

      <Layout style={{ background: "transparent" }}>
        <Header
          style={{
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
            position: "sticky",
            top: 0,
            zIndex: 100,
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
            background: "rgba(255, 255, 255, 0.1)",
            boxShadow:
              "0 20px 50px rgba(147, 197, 253, 0.15), 0 10px 20px rgba(0,0,0,0.02)",
            border: "1px solid rgba(255, 255, 255, 1)",
            position: "relative",
            overflowY: "auto",
            minHeight: "83.5vh",
            borderRadius: 8,
            transition: "all 0.3s",
            padding: 24,
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

      <style jsx global>{`
        .ant-layout-sider-trigger {
          background: rgba(255, 255, 255, 0.1) !important; /* 设为极淡的透明 */
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.3) !important;
          color: #6366f1 !important;
          transition: all 0.3s ease;
        }

        .ant-layout-sider-trigger:hover {
          background: rgba(255, 255, 255, 0.2) !important; /* 悬浮时变亮 */
          color: #a855f7 !important;
        }

        /* 2. 移除侧边栏默认边框线 */
        .ant-layout-sider-children {
          border-right: none !important;
        }

        /* 3. 让菜单背景也透明 */
        .ant-menu {
          background: transparent !important;
          border-right: none !important;
        }

        /* 4. 菜单项美化：变成圆角小胶囊 */
        .ant-menu-item {
          border-radius: 12px !important;
          margin: 4px 12px !important;
          width: calc(100% - 24px) !important;
        }

        .ant-menu-item-selected {
          background: rgba(99, 102, 241, 0.1) !important;
          color: #6366f1 !important;
          font-weight: 600;
        }
      `}</style>
    </Layout>
  );
}
