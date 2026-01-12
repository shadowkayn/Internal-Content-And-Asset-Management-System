"use client";

import { Menu } from "antd";
import { usePathname, useRouter } from "next/dist/client/components/navigation";
import { MenuConfig } from "@/constants/menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import React, { useMemo } from "react";

interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  permission?: string | null;
  children?: MenuItem[];
}

export function SidebarMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  // 过滤菜单
  const filteredMenu = useMemo(() => {
    return (MenuConfig as MenuItem[]).filter((item) => {
      if (!item.permission) return true;
      return user?.permissions?.includes(item.permission);
    });
  }, [user]);

  // 预先计算所有需要展开的父级 Key
  const allParentKeys = useMemo(() => {
    const keys: string[] = [];
    const getKeys = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          keys.push(item.key);
          getKeys(item.children);
        }
      });
    };
    getKeys(filteredMenu);
    return keys;
  }, [filteredMenu]);

  // 转换 AntD 所需的 items 格式
  const menuItems = useMemo(() => {
    const build = (list: MenuItem[]): any[] => {
      return list
        .map((item) => {
          if (item.children) {
            const sub = item.children.filter(
              (c) => !c.permission || user?.permissions?.includes(c.permission),
            );
            if (sub.length === 0) return null;
            return {
              key: item.key,
              label: item.label,
              icon: item.icon,
              children: build(sub),
            };
          }
          return { key: item.key, label: item.label, icon: item.icon };
        })
        .filter(Boolean);
    };
    return build(filteredMenu);
  }, [filteredMenu, user]);

  // 处理选中状态，确保刷新不丢失
  // 如果 pathname 是 /admin/contents/preview/123，则选中 /admin/contents/preview
  const selectedKeys = useMemo(() => {
    if (!pathname) return [];
    const keys = [pathname];
    // 增加逻辑：如果当前路径在菜单里找不到，尝试匹配父级路径
    const findActiveKey = (items: any[]) => {
      for (const item of items) {
        if (pathname.startsWith(item.key)) keys.push(item.key);
        if (item.children) findActiveKey(item.children);
      }
    };
    findActiveKey(menuItems);
    return keys;
  }, [pathname, menuItems]);

  if (!user) return null;

  return (
    <Menu
      theme="light"
      mode="inline"
      /*
         【核心技巧】：使用 key 绑定权限数据的长度。
         当 user 加载完成，filteredMenu 从 0 变成 N 时，key 变化，
         Menu 会重新挂载(remount)，此时 defaultOpenKeys 就会生效，展开所有。
      */
      key={filteredMenu.length}
      defaultOpenKeys={allParentKeys}
      selectedKeys={selectedKeys}
      items={menuItems}
      onClick={(item) => router.push(item.key)}
      style={{ background: "transparent", borderRight: "none" }}
    />
  );
}
