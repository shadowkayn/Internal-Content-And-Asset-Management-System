"use client";

import { useEffect, useState } from "react";

// /api/me 只返回当前用户信息（可以用 Route Handler 实现）
export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  return user;
}
