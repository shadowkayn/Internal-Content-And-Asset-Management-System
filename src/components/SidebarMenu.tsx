"use client";

import { Menu } from "antd";
import { usePathname, useRouter } from "next/dist/client/components/navigation";
import { MenuConfig } from "@/constants/menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function SidebarMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  const items = MenuConfig.filter((item) =>
    user?.permissions.includes(item.permission),
  );

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[pathname]}
      items={items.map((i) => ({
        key: i.key,
        label: i.label,
      }))}
      onClick={(item) => {
        router.push(item.key);
      }}
    />
  );
}
