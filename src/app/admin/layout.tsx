import { AdminLayout } from "@/components/AdminLayout";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/token";
import { getPermissionListAction } from "@/actions/permission.action";

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const payload = await verifyToken(token);
  const allowedPaths: any | string[] = payload?.allowedPaths || [];
  const userPermissions: string[] = payload?.permissions || [];

  // 全量菜单
  const { data } = await getPermissionListAction("menu");
  const allMenus = data?.list || [];

  const filterMenu: any = (nodes: any[]) => {
    return nodes
      .filter((node) => {
        // 校验当前节点路径是否在允许列表中
        return allowedPaths.includes(node.path);
      })
      .map((node) => {
        if (node.children) {
          return { ...node, children: filterMenu(node.children) };
        }
        return node;
      });
  };
  // 有权限的菜单
  const filteredMenuItems = filterMenu(allMenus || []);

  // 这里包裹 AdminLayout，只会影响 (admin) 分组下的页面
  return <AdminLayout initialMenu={filteredMenuItems}>{children}</AdminLayout>;
}
