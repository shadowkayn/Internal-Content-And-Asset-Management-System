import { Permissions } from "./permissions";
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";

/**
 * ⚠️ 注意：此配置文件已废弃，仅作为参考
 * 
 * 菜单配置已改为动态获取，通过后端接口返回 initialMenu
 * 请在数据库的权限管理模块中配置菜单
 * 
 * 如需添加新菜单，请：
 * 1. 在数据库中添加权限配置
 * 2. 创建对应的页面路由
 * 3. 确保权限验证正确
 */

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
