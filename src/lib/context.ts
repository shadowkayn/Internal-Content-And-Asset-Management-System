// 在服务层（Service Layer）自动获取用户信息，可以避免在每个 Controller/API Route 中重复手动传递 userId，让代码更简洁且不易遗漏。
// 但在 Node.js 中，由于它是异步非阻塞的，不像 Java Spring 有 ThreadLocal。
// 要实现这一点，需要使用 Node.js 提供的 AsyncLocalStorage。

import { AsyncLocalStorage } from "node:async_hooks";

// 定义存储的内容结构
export interface UserContext {
  userId: string;
  role?: string;
  permissions?: string[];
}

export const userStorage = new AsyncLocalStorage<UserContext>();
