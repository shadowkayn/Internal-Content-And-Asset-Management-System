import { useState, useEffect } from "react";
import { getDictDataListAction } from "@/actions/sysDict.actions";

export function useDictOptions(type: string) {
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res: any = await getDictDataListAction(type);
        if (res.success) {
          const list = res.list?.dictData || [];
          setOptions(list);
        } else {
          console.error("获取字典数据失败:", res.error);
          setOptions([]);
        }
      } catch (error) {
        console.error("获取字典数据异常:", error);
        setOptions([]);
      }
    };

    if (type) {
      fetchOptions().then();
    }
  }, [type]);

  return { options };
}
