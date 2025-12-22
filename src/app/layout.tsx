import "antd/dist/reset.css";
import { ReactNode } from "react";

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
