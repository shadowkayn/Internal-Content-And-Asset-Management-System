/**
 * 自定义错误类
 * 为不同类型的错误提供统一的错误处理机制
 */

/**
 * 权限错误 - 用户无权限执行某操作
 */
export class PermissionError extends Error {
  statusCode = 403;
  
  constructor(message: string = "无权限执行该操作") {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * 验证错误 - 输入数据不符合要求
 */
export class ValidationError extends Error {
  statusCode = 400;
  
  constructor(message: string = "数据验证失败") {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * 状态错误 - 当前状态不允许执行该操作
 */
export class StateError extends Error {
  statusCode = 400;
  
  constructor(message: string = "当前状态不允许该操作") {
    super(message);
    this.name = "StateError";
  }
}

/**
 * 资源未找到错误
 */
export class NotFoundError extends Error {
  statusCode = 404;
  
  constructor(message: string = "资源不存在") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * 冲突错误 - 并发操作冲突
 */
export class ConflictError extends Error {
  statusCode = 409;
  
  constructor(message: string = "操作冲突，请重试") {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * 事务错误 - 数据库事务失败
 */
export class TransactionError extends Error {
  statusCode = 500;
  
  constructor(message: string = "操作失败，请重试") {
    super(message);
    this.name = "TransactionError";
  }
}
