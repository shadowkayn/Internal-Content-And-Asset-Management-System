"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * 权限检查 Hook
 * @returns hasPermission 函数，用于检查用户是否有某个权限
 */
export function usePermission() {
  const userInfo = useCurrentUser();

  /**
   * 检查用户是否有指定权限
   * @param permissionCode 权限代码，如 "content:create"
   * @returns boolean
   */
  const hasPermission = (permissionCode: string): boolean => {
    if (!userInfo) return false;

    // admin 拥有所有权限
    if (userInfo.role === "admin") return true;

    // 检查用户权限列表中是否包含该权限
    return userInfo.permissions?.includes(permissionCode) || false;
  };

  /**
   * 检查用户是否有任意一个权限
   * @param permissionCodes 权限代码数组
   * @returns boolean
   */
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return permissionCodes.some((code) => hasPermission(code));
  };

  /**
   * 检查用户是否有所有权限
   * @param permissionCodes 权限代码数组
   * @returns boolean
   */
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return permissionCodes.every((code) => hasPermission(code));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
