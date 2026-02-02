import "antd/dist/reset.css";
import { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <title>管理系统</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AntdRegistry>
          <ConfigProvider locale={zhCN}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
