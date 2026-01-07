import React, { useMemo } from "react";
import { Select, SelectProps } from "antd";
import { useDictOptions } from "@/hooks/useDictOptions";

// 定义选项的接口
interface DictOption {
  label: string;
  value: string | number;
}

interface CustomSelectProps extends SelectProps {
  // 扩展属性：支持传入字典代码
  dictCode?: string;
  // 扩展属性：支持直接传入选项（可选）
  selectOptions?: DictOption[];
}

const CommonSelect: React.FC<CustomSelectProps> = ({
  dictCode,
  selectOptions,
  placeholder = "请选择",
  ...props
}) => {
  const { options: dictOptions } = useDictOptions(dictCode as string);

  const finalOptions = useMemo(() => {
    return dictCode ? dictOptions : selectOptions;
  }, [dictCode, selectOptions]);

  return <Select placeholder={placeholder} options={finalOptions} {...props} />;
};

export default CommonSelect;
