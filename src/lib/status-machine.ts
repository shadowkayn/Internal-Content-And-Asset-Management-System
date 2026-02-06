/**
 * 文章状态机模块
 * 定义文章状态流转规则和验证逻辑
 */

export type Status = "draft" | "pending" | "published" | "archived";

/**
 * 状态转换规则表
 * 定义每个状态可以转换到哪些状态
 */
export const STATUS_TRANSITIONS: Record<Status, Status[]> = {
  draft: ["pending"], // 草稿只能提交审核
  pending: ["published", "draft"], // 待审核可以通过或驳回
  published: ["archived"], // 已发布只能归档
  archived: [], // 已归档不能转换（终态）
};

/**
 * 检查状态转换是否合法
 * @param from 当前状态
 * @param to 目标状态
 * @returns 是否允许该转换
 */
export function isValidTransition(from: Status, to: Status): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * 验证状态转换，如果非法则抛出错误
 * @param from 当前状态
 * @param to 目标状态
 * @throws Error 如果状态转换非法
 */
export function validateStatusTransition(from: Status, to: Status): void {
  if (!isValidTransition(from, to)) {
    throw new Error(`非法的状态转换：不能从 ${from} 转换到 ${to}`);
  }
}
