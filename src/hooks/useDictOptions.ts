import { useState, useEffect } from "react";
import { getDictDataListAction } from "@/actions/sysDict.actions";

// 在 Hook 外部定义缓存对象，它不会随着组件重新渲染而重置
const dictCache: Record<string, any[]> = {};
// 增加一个记录正在请求中的 Promise，防止同一时间重复请求
const pendingRequests: any = {};

export function useDictOptions(type: string) {
  const [options, setOptions] = useState<any[]>(dictCache[type] || []);

  useEffect(() => {
    if (!type) return;

    // 如果缓存里已经有了，直接使用，不再请求
    if (dictCache[type]) {
      setOptions(dictCache[type]);
      return;
    }

    const fetchOptions = async () => {
      // 如果当前 type 已经在请求中了，直接等待那个请求的结果
      if (pendingRequests[type]) {
        const list = await pendingRequests[type];
        setOptions(list);
        return;
      }

      try {
        // 将当前请求存入 pending 状态
        pendingRequests[type] = (async () => {
          const res: any = await getDictDataListAction(type);
          if (res.success) {
            const list = res.list?.dictData || [];
            dictCache[type] = list; // 存入缓存
            return list;
          }
          return [];
        })();

        const finalOptions = await pendingRequests[type];
        setOptions(finalOptions);
      } catch (error) {
        console.error("获取字典数据异常:", error);
        setOptions([]);
      } finally {
        // 请求完成后清除 pending 状态
        delete pendingRequests[type];
      }
    };

    fetchOptions().then();
  }, [type]);

  return { options };
}
