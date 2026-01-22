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
import React, { useEffect, useState } from "react";
import { logoutAction } from "@/actions/auth.actions";
import { usePathname, useRouter } from "next/dist/client/components/navigation";
import { MenuConfig } from "@/constants/menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const { Header, Content, Footer, Sider } = Layout;

export function AdminLayout({
  initialMenu,
  children,
}: {
  children: React.ReactNode;
  initialMenu: any;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const userInfo = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      logoutAction().then(() => {
        router.replace("/auth/login");
        message.success("退出登录成功");
      });
    }
  };

  // 动态生成面包屑
  const getBreadcrumbItems = () => {
    const items: { title: React.ReactNode; href?: string }[] = [
      { title: "首页" },
    ];

    // 1. 将 pathname 拆分为片段，例如 /admin/contents/preview/123 -> ['admin', 'contents', 'preview', '123']
    const snippets = pathname.split("/").filter(Boolean);

    // 2. 递归查找 MenuConfig 中的 label
    const findLabelInConfig = (key: string, config: any[]): string | null => {
      for (const item of config) {
        if (item.key === key) return item.label;
        if (item.children) {
          const found = findLabelInConfig(key, item.children);
          if (found) return found;
        }
      }
      return null;
    };

    // 3. 逐步构建路径并匹配
    let currentPath = "";
    snippets.forEach((snippet, index) => {
      currentPath += `/${snippet}`;

      // 跳过根路径 /admin 本身（如果你不需要显示“后台”这一级的话）
      if (currentPath === "/admin") return;

      const label = findLabelInConfig(currentPath, MenuConfig);

      if (label) {
        // 如果在配置里找到了，直接添加
        items.push({ title: label });
      } else {
        // 如果没找到，判断是否是动态 ID (比如 MongoDB ID 长度通常为 24)
        // 或者判断是否是最后一段路径
        if (index === snippets.length - 1) {
          // 如果上一级是 preview，这里可以显示为“详情”
          const isDetail =
            snippets[index - 1] === "preview" || snippets[index - 1] === "list";
          items.push({ title: isDetail ? "详情" : snippet });
        }
      }
    });

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (!mounted) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f5f7ff 0%, #fff1f2 50%, #f0fdf4 100%)",
        }}
      />
    );
  }

  return (
    <Layout
      style={{
        background:
          "linear-gradient(135deg, #f5f7ff 0%, #fff1f2 50%, #f0fdf4 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <Header
        style={{
          height: 64,
          background:
            "linear-gradient(90deg, rgba(238, 242, 255, 0.5) 0%, rgba(255, 241, 242, 0.5) 50%, rgba(240, 253, 244, 0.5) 100%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          padding: "0 24px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: "900",
              marginRight: 40,
              backgroundImage:
                "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transition: "all 0.3s",
              cursor: "pointer",
              width: collapsed ? 95 : 195,
              textAlign: "center",
            }}
            onClick={() => router.push("/")}
          >
            {collapsed ? "K" : "KAYN ADMIN"}
          </div>

          <Breadcrumb items={breadcrumbItems} />
        </div>

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
                src={userInfo?.avatar || null}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              <span style={{ fontWeight: 500 }}>
                {userInfo?.roleName || "--"}
              </span>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Layout style={{ background: "transparent" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          breakpoint="lg"
          theme="light"
          width={220}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)", // 极高透明度
            backdropFilter: "blur(30px)",
            borderRight: "none",
            boxShadow: "10px 0 30px rgba(0,0,0,0.01)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <SidebarMenu menuData={initialMenu} />
        </Sider>

        <Layout style={{ background: "transparent" }}>
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

        .ant-layout-sider-children {
          border-right: none !important;
        }

        .ant-menu {
          background: rgba(255, 255, 255, 0.6) !important;
          border-right: none !important;
        }

        .ant-menu-item-selected {
          background: rgba(99, 102, 241, 0.1) !important;
          color: #6366f1 !important;
          font-weight: 600;
        }

        .ant-menu-item:hover,
        .ant-menu-submenu-title:hover {
          background: rgba(255, 255, 255, 0.5) !important;
          color: #6366f1 !important;
        }

        .ant-menu-submenu-selected .ant-menu-submenu-title {
          color: #6366f1 !important;
        }

        .ant-menu-item .ant-menu-item-icon,
        .ant-menu-submenu-title .ant-menu-item-icon {
          font-size: 16px !important;
          transition: transform 0.3s ease;
        }

        .ant-menu-item,
        .ant-menu-submenu-title {
          margin: 4px 12px !important;
          width: calc(100% - 24px) !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
        }
      `}</style>
    </Layout>
  );
}
