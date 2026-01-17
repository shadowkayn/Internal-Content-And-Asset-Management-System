"use client";

import { Menu } from "antd";
import { usePathname, useRouter } from "next/dist/client/components/navigation";
import React, { useMemo } from "react";
import * as Icons from "@ant-design/icons";

export function SidebarMenu({ menuData = [] }: { menuData: any[] }) {
  const pathname = usePathname();
  const router = useRouter();

  // 将数据库的树结构转换为 AntD 需要的 items 格式
  const menuItems = useMemo(() => {
    const buildItems = (list: any[]): any[] => {
      return list.map((item) => {
        // 动态获取图标：如果数据库存的是 "DashboardOutlined"，则取出对应的组件
        const IconComponent = item.icon ? (Icons as any)[item.icon] : null;

        return {
          key: item.path,
          label: item.name,
          icon: IconComponent ? React.createElement(IconComponent) : null,
          // 如果有子项且子项不为空，递归处理
          children:
            item.children && item.children.length > 0
              ? buildItems(item.children)
              : null,
        };
      });
    };
    return buildItems(menuData);
  }, [menuData]);

  // 计算所有需要默认展开的父级 Key
  const allParentKeys = useMemo(() => {
    const keys: string[] = [];
    const getKeys = (list: any[]) => {
      list.forEach((item) => {
        if (item.children && item.children.length > 0) {
          keys.push(item.path);
          getKeys(item.children);
        }
      });
    };
    getKeys(menuData);
    return keys;
  }, [menuData]);

  // 处理选中状态（兼容动态路由）
  const selectedKeys = useMemo(() => {
    if (!pathname) return [];
    const keys = [pathname];

    // 如果当前路径是 /admin/contents/preview/123，
    // 且菜单里只有 /admin/contents/preview，则选中它
    const findActiveKey = (items: any[]) => {
      for (const item of items) {
        if (pathname.startsWith(item.key)) {
          keys.push(item.key);
        }
        if (item.children) findActiveKey(item.children);
      }
    };
    findActiveKey(menuItems);
    return Array.from(new Set(keys)); // 去重
  }, [pathname, menuItems]);

  return (
    <Menu
      theme="light"
      mode="inline"
      /*
         使用 menuData 的长度或内容作为 key。
         当权限改变（menuData 变化）时，Menu 会销毁并重新挂载，
         从而触发 defaultOpenKeys 重新计算，实现“默认全展开”。
      */
      key={JSON.stringify(menuData)}
      defaultOpenKeys={allParentKeys}
      selectedKeys={selectedKeys}
      items={menuItems}
      onClick={(item) => {
        // 点击跳转到对应的 path
        router.push(item.key);
      }}
      style={{ background: "transparent", borderRight: "none" }}
    />
  );
}
