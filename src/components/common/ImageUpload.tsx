"use client";

import { useState } from "react";
import { message, Upload } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

interface Props {
  value?: string;
  onChange?: (url: string) => void;
}
export default function ImageUpload({ onChange, value }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.code === 200) {
        onSuccess(data.data.url);
        onChange?.(data.data.url);
        message.success("上传成功");
      } else {
        onError(data.message);
        message.error(data.message || "上传失败");
      }
    } catch (e: any) {
      onError(e);
      message.error(e.message || "上传失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-uploader">
      <Upload
        listType="picture-card"
        showUploadList={false}
        customRequest={handleUpload} // 自定义请求
        accept="image/*"
        style={{ borderRadius: "20px" }}
      >
        {value ? (
          <img
            src={value}
            alt="cover"
            style={{
              width: "100%",
              borderRadius: "16px",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{ padding: "20px" }}>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>选择图片</div>
          </div>
        )}
      </Upload>

      <style jsx global>{`
        .ant-upload.ant-upload-select {
          border-radius: 20px !important;
          background: rgba(255, 255, 255, 0.4) !important;
          backdrop-filter: blur(10px);
          border: 1px dashed rgba(99, 102, 241, 0.3) !important;
          transition: all 0.3s;
          overflow: hidden;
          width: 120px !important;
          height: 120px !important;
        }
        .ant-upload:hover {
          border-color: #6366f1 !important;
          background: rgba(255, 255, 255, 0.6) !important;
        }
      `}</style>
    </div>
  );
}
