"use client";

import {
  getPermissionButtonAction,
  getPermissionListAction,
} from "@/actions/permission.action";
import { useEffect, useState } from "react";

export function useGetUserPermissions() {
  const [menuList, setMenuList] = useState<any>([]);
  const [buttonList, setButtonList] = useState<any>([]);
  try {
    const fetchPermissions = async () => {
      const [res1, res2] = await Promise.all([
        getPermissionListAction("menu"),
        getPermissionButtonAction(),
      ]);
      if (res1.success && res2.success) {
        setMenuList(res1?.data?.list || []);
        setButtonList(res2?.data?.list || []);
      }
    };

    useEffect(() => {
      fetchPermissions().then();
    }, []);

    return {
      menuList,
      buttonList,
    };
  } catch (e: any) {
    console.error(e.message || "获取权限失败");
  }
}
