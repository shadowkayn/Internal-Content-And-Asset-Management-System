import { Permissions } from "./permissions";

export const MenuConfig = [
  {
    key: "/admin/contents",
    label: "内容管理",
    permission: Permissions.CONTENT_MANAGE,
  },
  {
    key: "/admin/users",
    label: "用户管理",
    permission: Permissions.USER_MANAGE,
  },
];
