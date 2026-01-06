"use client";

import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Input, message } from "antd";
import { PlusOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import {
  getDictDataListAction,
  updateDictDataAction,
} from "@/actions/sysDict.actions";
// 引入 dnd-kit 相关组件 实现拖拽排序
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DictDataModel {
  id?: string;
  dictId?: string;
  label: string;
  value: string;
  sort: number;
}

interface Props {
  open: boolean;
  onCancel: () => void;
  dictId: string;
  dictName: string;
}

// 自定义行组件
interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const Row = (props: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props["data-row-key"],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "move",
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  return (
    <tr
      {...props}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    />
  );
};

export default function DictDataModel({
  open,
  onCancel,
  dictId,
  dictName,
}: Props) {
  const [dataList, setDataList] = useState<DictDataModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // 传感器配置 (防止点击输入框时触发拖拽)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // 点击移动1px以上才触发拖拽，保证点击 Input 不会失效
      },
    }),
  );

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setTableLoading(true);
        const res: any = await getDictDataListAction(dictId);
        if (res.success) {
          const list = res.list?.dictData || [];
          setDataList(list.sort((a: any, b: any) => a.sort - b.sort));
        } else {
          message.error(res.message);
        }
      } catch (e: any) {
        message.error(e.message);
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    };

    fetchData();
  }, [dictId, open]);

  const columns: any = [
    {
      title: "排序",
      key: "sort",
      align: "center",
      width: 60,
      render: () => <MenuOutlined style={{ cursor: "grab", color: "#999" }} />,
    },
    {
      title: "字典标签",
      dataIndex: "label",
      render: (text: string, record: any, index: number) => (
        <Input
          value={text}
          onChange={(e) => updateField(index, "label", e.target.value)}
          placeholder="如：男"
        />
      ),
    },
    {
      title: "字典键值",
      dataIndex: "value",
      render: (text: string, record: any, index: number) => (
        <Input
          value={text}
          onChange={(e) => updateField(index, "value", e.target.value)}
          placeholder="如：1"
        />
      ),
    },
    {
      title: "操作",
      width: 80,
      render: (_: any, record: DictDataModel, index: number) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeRow(record, index)}
        />
      ),
    },
  ];

  const removeRow = (record: DictDataModel, index: number) => {
    setDataList(
      dataList.filter((item, currentIndex) => index !== currentIndex),
    );
  };

  const updateField = (index: number, field: string, value: string) => {
    setDataList(
      dataList.map((item, currentIndex) =>
        index === currentIndex ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSaveAll = async () => {
    if (dataList.some((item) => !item.label || !item.value)) {
      message.error("请填写完整的数据");
      return;
    }

    setLoading(true);
    setTableLoading(true);
    const res = await updateDictDataAction(dictId, dataList);
    if (res.success) {
      message.success("保存成功");
      onCancel();
    } else {
      message.error(res.error);
    }
  };

  const addRow = () => {
    setDataList([
      ...dataList,
      {
        label: "",
        value: "",
        sort: dataList.length + 1,
        // 如果没有 id，临时给一个 key 供拖拽使用
        id: `temp-${Date.now()}`,
      },
    ]);
  };

  // 拖拽结束逻辑
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataList((prev) => {
        const activeIndex = prev.findIndex((item) => item.id === active.id);
        const overIndex = prev.findIndex((item) => item.id === over?.id);

        if (activeIndex === -1 || overIndex === -1) return prev;

        const nexList = arrayMove(prev, activeIndex, overIndex);

        // 重新计算 sort 字段
        return nexList.map((item, index) => ({
          ...item,
          sort: index + 1,
        }));
      });
    }
  };

  return (
    <Modal
      title={`字典数据管理 - ${dictName}`}
      open={open}
      onCancel={onCancel}
      onOk={handleSaveAll}
      confirmLoading={loading}
      width={700}
      okText="保存"
    >
      <div style={{ marginBottom: 16, marginTop: 16 }}>
        <Button type="dashed" onClick={addRow} block icon={<PlusOutlined />}>
          新增一项
        </Button>
      </div>

      {/*DndContext 包裹 Table*/}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext
          items={dataList.map((item) => item.id!)}
          strategy={verticalListSortingStrategy}
        >
          <Table
            dataSource={dataList}
            loading={tableLoading}
            columns={columns}
            pagination={false}
            rowKey="id"
            scroll={{ y: 400 }}
            components={{
              body: {
                row: Row,
              },
            }}
          />
        </SortableContext>
      </DndContext>
    </Modal>
  );
}
