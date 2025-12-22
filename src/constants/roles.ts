import { Permissions } from "@/constants/permissions";

export const RolePermissions = {
  admin: Object.values(Permissions),
  editor: [Permissions.CONTENT_CREATE, Permissions.CONTENT_UPDATE],
  viewer: [],
};
