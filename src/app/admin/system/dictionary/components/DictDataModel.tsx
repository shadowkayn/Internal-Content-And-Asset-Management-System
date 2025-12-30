"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Button,
  Input,
  InputNumber,
  Space,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getDictDataListAction,
  updateDictDataAction,
} from "@/actions/sysDict.actions";

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

export default function DictDataModel({
  open,
  onCancel,
  dictId,
  dictName,
}: Props) {
  const [dataList, setDataList] = useState<DictDataModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTableLoading(true);
        const res: any = await getDictDataListAction(dictId);
        if (res.success) {
          setDataList(res.list?.dictData || ([] as DictDataModel[]));
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
  }, [dictId]);

  const columns: any = [
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
    console.log(dataList, "submit");
  };

  const addRow = () => {
    setDataList([
      ...dataList,
      {
        label: "",
        value: "",
        sort: dataList.length + 1,
      },
    ]);
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
      <Table
        dataSource={dataList}
        loading={tableLoading}
        columns={columns}
        pagination={false}
        rowKey={(record) => record.id || record.dictId!}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
}
