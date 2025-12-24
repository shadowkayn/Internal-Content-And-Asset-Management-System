"use client";

import { Menu } from "antd";
import { usePathname, useRouter } from "next/dist/client/components/navigation";
import { MenuConfig } from "@/constants/menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function SidebarMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  console.log("user", user);

  const filteredMenu = MenuConfig.filter((item) => {
    if (!item.permission) return true;
    return user?.permissions.includes(item.permission);
  });

  const buildMenuItems = (menuItems: any[]): any => {
    return menuItems
      .map((item: any) => {
        if (item.children) {
          const filteredChildren = item.children.filter((child: any) => {
            if (!child.permission) return true;
            return user?.permissions?.includes(child.permission);
          });

          if (filteredChildren.length === 0) return null;

          return {
            key: item.key,
            label: item.label,
            icon: item.icon,
            children: buildMenuItems(filteredChildren),
          };
        }
        return {
          key: item.key,
          label: item.label,
          icon: item.icon,
        };
      })
      .filter(Boolean);
  };

  return (
    <Menu
      theme={"light"}
      mode="inline"
      selectedKeys={[pathname]}
      items={buildMenuItems(filteredMenu)}
      onClick={(item) => {
        router.push(item.key);
      }}
    />
  );
}
