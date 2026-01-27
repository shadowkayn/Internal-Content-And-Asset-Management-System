"use client";

import { useState } from "react";
import { message, Upload, UploadProps } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

interface ImageUploadProps extends Omit<UploadProps, "onChange" | "value"> {
  value?: string;
  onChange?: (url: string) => void;
}
export default function ImageUpload({
  onChange,
  value,
  ...restProps
}: ImageUploadProps) {
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

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <div className="custom-uploader">
      <Upload
        listType="picture-card"
        showUploadList={false}
        customRequest={handleUpload} // 自定义请求
        accept="image/*"
        {...restProps}
      >
        {value ? (
          <img
            src={value}
            alt="avatar"
            draggable={false}
            style={{
              width: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          uploadButton
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
