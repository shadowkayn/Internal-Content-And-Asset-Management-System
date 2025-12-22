import { getCurrentUser } from "@/lib/auth";

export const Permissions = {
  CONTENT_CREATE: "content:create",
  CONTENT_UPDATE: "content:update",
  CONTENT_PUBLISH: "content:publish",
  CONTENT_MANAGE: "content:manage",
  USER_MANAGE: "user:manage",
} as const;

export async function hasPermission(permission: string) {
  const user = await getCurrentUser();

  if (!user) return false;

  return user.permissions.includes(permission);
}
