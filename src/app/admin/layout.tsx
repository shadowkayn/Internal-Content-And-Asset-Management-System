import { AdminLayout } from "@/components/AdminLayout";
import { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  // 这里包裹 AdminLayout，只会影响 (admin) 分组下的页面
  return <AdminLayout>{children}</AdminLayout>;
}
