import { Permissions } from "./permissions";
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export const MenuConfig = [
  {
    key: "/admin/dashboard",
    label: "仪表盘",
    icon: <DashboardOutlined />,
    permission: null,
  },
  {
    key: "/admin/contents",
    label: "内容管理",
    icon: <FileTextOutlined />,
    permission: Permissions.CONTENT_MANAGE,
    children: [
      {
        key: "/admin/contents/list",
        label: "内容列表",
        permission: Permissions.CONTENT_MANAGE,
      },
      {
        key: "/admin/contents/preview",
        label: "内容预览",
        permission: Permissions.CONTENT_MANAGE,
      },
    ],
  },
  {
    key: "/admin/users",
    label: "用户管理",
    icon: <UserOutlined />,
    permission: Permissions.USER_MANAGE,
    children: [
      {
        key: "/admin/users/list",
        label: "用户列表",
        permission: Permissions.USER_MANAGE,
      },
      {
        key: "/admin/users/roles",
        label: "角色管理",
        permission: Permissions.USER_MANAGE,
      },
    ],
  },
  {
    key: "/admin/system",
    label: "系统管理",
    icon: <SettingOutlined />,
    permission: Permissions.SYSTEM_MANAGE,
    children: [
      {
        key: "/admin/system/settings",
        label: "系统设置",
        permission: Permissions.SYSTEM_MANAGE,
      },
      {
        key: "/admin/system/logs",
        label: "系统日志",
        permission: Permissions.SYSTEM_MANAGE,
      },
      {
        key: "/admin/system/dictionary",
        label: "字典管理",
        permission: Permissions.SYSTEM_MANAGE,
      },
      {
        key: "/admin/system/permission",
        label: "权限管理",
        permission: Permissions.SYSTEM_MANAGE,
      },
    ],
  },
];
