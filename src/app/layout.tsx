import "antd/dist/reset.css";
import { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>管理系统</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
