"use client";

// 使用富文本编辑器注意事项：必须使用 Next.js 的 dynamic 导入，并设置 ssr: false，否则页面会崩溃
// 关键：禁用 SSR
// const RichTextEditor = dynamic(() => import('@/components/Editor/RichTextEditor'), {
//   ssr: false,
//   loading: () => <div style={{ height: 200, background: '#f5f5f5', borderRadius: 12 }} />
// });

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { BubbleMenu } from "@tiptap/react/menus";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";

import React, { useEffect, useCallback, useRef } from "react";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  PictureOutlined,
  TableOutlined,
  RollbackOutlined,
  EnterOutlined,
  ClearOutlined,
  FontSizeOutlined,
  BlockOutlined,
  CodeOutlined,
  FontColorsOutlined,
  BgColorsOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { Button, Tooltip, Space, Divider, Popover, ColorPicker } from "antd";

// 工具栏按钮组件
const ToolButton = ({ onClick, icon, active, title, danger = false }: any) => (
  <Tooltip title={title} mouseEnterDelay={0.5}>
    <Button
      type={active ? "primary" : "text"}
      size="small"
      danger={danger}
      icon={icon}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      style={{ borderRadius: "6px" }}
    />
  </Tooltip>
);

const RichTextEditor = ({ value, onChange }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }), // 必须配置 multicolor 才能使用自定义颜色
      TextAlign.configure({ types: ["heading", "paragraph"] }), // 指定哪些节点可以对齐
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: "editor-image" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "editor-link" },
      }),
      Placeholder.configure({ placeholder: "在此输入精彩内容..." }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // 监听外部数据回显
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // --- 功能逻辑函数 ---
  const addLink = useCallback(() => {
    const url = window.prompt("输入链接地址");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        editor
          ?.chain()
          .focus()
          .setImage({ src: event.target?.result as string })
          .run();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!editor) return null;

  return (
    <div
      className="rich-editor-container"
      style={{
        border: "1px solid #eef2f6",
        borderRadius: "16px",
        background: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
        overflow: "hidden",
      }}
    >
      {/* 顶部工具栏 */}
      <div
        className="editor-toolbar"
        style={{
          padding: "8px 12px",
          background: "#fafafa",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
        }}
      >
        {/* 历史与清除 */}
        <Space size={2}>
          <ToolButton
            title="撤销"
            icon={<RollbackOutlined />}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolButton
            title="清除格式"
            icon={<ClearOutlined />}
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
          />
        </Space>

        <Divider orientation="vertical" />

        {/* 基础排版 */}
        <Space size={2}>
          <ToolButton
            title="加粗"
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          />
          <ToolButton
            title="斜体"
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          />
          <ToolButton
            title="下划线"
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          />

          <Tooltip title="文字颜色">
            <ColorPicker
              size="small"
              onChange={(color) =>
                editor.chain().focus().setColor(color.toHexString()).run()
              }
            >
              <Button type="text" size="small" icon={<FontColorsOutlined />} />
            </ColorPicker>
          </Tooltip>

          <Tooltip title="背景高亮">
            <ColorPicker
              size="small"
              onChange={(color) =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: color.toHexString() })
                  .run()
              }
            >
              <Button type="text" size="small" icon={<BgColorsOutlined />} />
            </ColorPicker>
          </Tooltip>
        </Space>

        <Divider orientation="vertical" />

        {/* 对齐方式 */}
        <Space size={2}>
          <ToolButton
            title="左对齐"
            icon={<AlignLeftOutlined />}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
          />
          <ToolButton
            title="居中对齐"
            icon={<AlignCenterOutlined />}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
          />
          <ToolButton
            title="右对齐"
            icon={<AlignRightOutlined />}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
          />
        </Space>

        <Divider orientation="vertical" />

        {/* 列表与任务 */}
        <Space size={2}>
          <ToolButton
            title="无序列表"
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          />
          <ToolButton
            title="有序列表"
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          />
          <ToolButton
            title="任务列表"
            icon={<CheckSquareOutlined />}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            active={editor.isActive("taskList")}
          />
          <ToolButton
            title="引用"
            icon={<BlockOutlined />}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          />
        </Space>

        <Divider orientation="vertical" />

        {/* 多媒体与表格 */}
        <Space size={2}>
          <ToolButton
            title="插入链接"
            icon={<LinkOutlined />}
            onClick={addLink}
            active={editor.isActive("link")}
          />
          <ToolButton
            title="上传图片"
            icon={<PictureOutlined />}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />

          <Popover
            content={
              <Space orientation="vertical">
                <Button
                  size="small"
                  block
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run()
                  }
                >
                  插入 3x3 表格
                </Button>
                <Button
                  size="small"
                  block
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  右侧增加列
                </Button>
                <Button
                  size="small"
                  block
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  下方增加行
                </Button>
                <Button
                  size="small"
                  block
                  danger
                  onClick={() => editor.chain().focus().deleteTable().run()}
                >
                  删除表格
                </Button>
              </Space>
            }
            title="表格操作"
            trigger="click"
          >
            <Button size="small" type="text" icon={<TableOutlined />} />
          </Popover>
        </Space>

        <Divider orientation="vertical" />
      </div>

      {/* 气泡菜单 (选中文本时弹出) */}
      {editor && (
        <BubbleMenu editor={editor} className="bubble-menu">
          <div
            style={{
              background: "#505d71",
              padding: "4px",
              borderRadius: "8px",
              display: "flex",
              gap: "4px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          >
            <Button
              size="small"
              type="text"
              style={{ color: "#fff" }}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              B
            </Button>
            <Button
              size="small"
              type="text"
              style={{ color: "#fff" }}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              I
            </Button>
            <Button
              size="small"
              type="text"
              style={{ color: "#fff" }}
              onClick={addLink}
            >
              Link
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* 编辑主体 */}
      <EditorContent editor={editor} style={{ minHeight: "350px" }} />

      {/* 底部字数统计 */}
      <div
        style={{
          padding: "6px 16px",
          borderTop: "1px solid #f1f5f9",
          fontSize: "12px",
          color: "#94a3b8",
          textAlign: "right",
          background: "#fcfcfc",
        }}
      >
        字符统计: {editor.getText().length || 0} 字
      </div>

      <style jsx global>{`
        .tiptap {
          padding: 32px;
          outline: none;
          min-height: 350px;
          color: #334155;
          line-height: 1.7;
        }

        /* 代码块背景 */
        .tiptap pre {
          background: #1e293b; /* 深色背景 */
          color: #f8fafc; /* 浅色文字 */
          font-family: "JetBrains Mono", "Fira Code", monospace;
          padding: 1rem 1.2rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          overflow-x: auto; /* 溢出滚动 */
        }
        .tiptap pre code {
          color: inherit;
          padding: 0;
          background: none;
          font-size: 0.9rem;
        }
        /* 行内代码样式 */
        .tiptap code {
          background-color: #f1f5f9;
          color: #e11d48;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
          display: block;
        }

        .editor-link {
          color: #4f46e5;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        /* 任务列表修正 */
        .tiptap ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .tiptap ul[data-type="taskList"] li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .tiptap ul[data-type="taskList"] input[type="checkbox"] {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        /* 占位符提示 */
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
        }

        /* 列表、引用、表格样式（维持之前的） */
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        .tiptap blockquote {
          border-left: 4px solid #818cf8;
          background: #f8fafc;
          padding: 1rem;
          font-style: italic;
          margin: 1.5rem 0;
        }
        .tiptap table {
          border-collapse: collapse;
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .tiptap td,
        .tiptap th {
          border: 1px solid #e2e8f0;
          padding: 10px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
