"use client";

import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import ReactMarkdown from "react-markdown";
import {
  Card,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Divider,
  message,
  Tooltip,
  Tag,
  Radio,
  Collapse,
  CardProps,
} from "antd";
import {
  RobotOutlined,
  SendOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  UserOutlined,
  ColumnWidthOutlined,
  FileTextOutlined,
  BulbOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import styles from "./index.module.css";
import AddContentModal from "../list/components/ContentModal";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Panel } = Collapse;

export default function AICreatorPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null); // 新增：用于内容区域
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    topic: "",
    tone: "casual",
    audience: "", // 目标读者
    length: "short", // 篇幅长度
    keywords: "",
    reference: "", // 参考素材
  });

  const [generatedRaw, setGeneratedRaw] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  // 自动滚动到底部（流式生成时实时跟随）
  useEffect(() => {
    if (scrollContainerRef.current && generatedRaw) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    }
  }, [generatedRaw]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedRaw);
    messageApi.success("内容已复制到剪贴板");
  };

  const handleGenerate = async () => {
    if (!config.topic) {
      messageApi.warning("请输入文章主题");
      return;
    }

    setLoading(true);
    setGeneratedRaw("");

    try {
      // 结构化、专业的 Prompt
      const fullPrompt = `
        你是一名专业的文章创作者。请根据以下要求撰写一篇文章：

        【核心要求】
        1. 主题：${config.topic}
        2. 风格：${config.tone}
        3. 目标读者：${config.audience || "普通大众"}
        4. 篇幅预估：${config.length === "short" ? "500字左右(简短快讯)" : config.length === "long" ? "2000字以上(深度长文)" : "1000-1500字(标准文章)"}
        ${config.keywords ? `5. 必须包含关键词：${config.keywords}` : ""}
        ${config.reference ? `6. 参考素材/背景信息：${config.reference}` : ""}

        【格式严格要求】
        1. 第一行必须是文章标题，以 "# " 开头。
        2. 第二行必须是文章的简要描述（用于列表展示，50-100字），以 "> 描述：" 开头。
        3. 从第三行开始是正文，使用标准的 Markdown 格式。
        4. 内容分段清晰，使用二级标题 (##) 组织结构。
      `;

      console.log("Prompt:", fullPrompt); // 调试用

      // 调用后端接口
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) throw new Error("API Error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = (await reader?.read()) || {};
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setGeneratedRaw((prev) => prev + chunk);
      }
    } catch (error) {
      console.error(error);
      messageApi.error("生成失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  const handleUseContent = async () => {
    if (!generatedRaw) return;

    const lines = generatedRaw.split("\n");
    let title = config.topic;
    let description = "";
    const bodyLines = [...lines];

    // 提取并移除标题行
    const titleIndex = bodyLines.findIndex((l) => l.trim().startsWith("# "));
    if (titleIndex !== -1) {
      title = bodyLines[titleIndex].replace("# ", "").trim();
      bodyLines.splice(titleIndex, 1);
    }

    // 提取并移除描述行
    const descIndex = bodyLines.findIndex((l) =>
      l.trim().startsWith("> 描述："),
    );
    if (descIndex !== -1) {
      description = bodyLines[descIndex].replace("> 描述：", "").trim();
      bodyLines.splice(descIndex, 1);
    }

    // 组合剩余内容为正文
    const bodyMarkdown = bodyLines.join("\n").trim();
    const htmlContent = await marked.parse(bodyMarkdown);

    setModalData({
      title: title,
      description: description,
      content: htmlContent as string,
    });
    setIsModalOpen(true);
  };

  const cardStyles: CardProps["styles"] = {
    body: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      overflowY: "auto",
    },
  };

  return (
    <div className={styles.container}>
      {contextHolder}

      {/* --- 左侧配置区 --- */}
      <div className={styles.sidebar}>
        <Card
          title={
            <Space>
              <RobotOutlined />
              <span>创作控制台</span>
            </Space>
          }
          variant={"borderless"}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
          styles={cardStyles}
        >
          {/* 主题 (核心) */}
          <div>
            <div style={{ marginBottom: 6, fontWeight: 500 }}>
              <BulbOutlined style={{ marginRight: 6 }} />
              文章主题 <span className="text-red-500">*</span>
            </div>
            <TextArea
              placeholder="例如：Next.js 14 的 Server Actions 深度解析..."
              autoSize={{ minRows: 3, maxRows: 5 }}
              value={config.topic}
              onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              count={{ show: true, max: 200 }}
            />
          </div>

          {/* 风格 */}
          <div>
            <div style={{ marginBottom: 6, fontWeight: 500 }}>文章风格</div>
            <Select
              style={{ width: "100%" }}
              value={config.tone}
              onChange={(val) => setConfig({ ...config, tone: val })}
              placeholder="选择文章基调"
              options={[
                { value: "casual", label: "📝 轻松草 (Casual)" },
                { value: "technical", label: "👨‍💻 硬核技术 (Technical)" },
                { value: "tutorial", label: "📖 新手教程 (Tutorial)" },
                { value: "opinion", label: "🧐 观点评论 (Opinionated)" },
                { value: "news", label: "📰 新闻资讯 (News)" },
                { value: "blog", label: "📝 博客文章 (Blog)" },
                { value: "howto", label: "🛠️ 教程 (How-to)" },
                { value: "reference", label: "📚 参考资料 (Reference)" },
                { value: "faq", label: "❓ 常见问题 (FAQ)" },
                { value: "listicle", label: "🔢 盘点清单 (Listicle)" },
                { value: "story", label: "📖 故事叙述 (Storytelling)" },
                { value: "essay", label: "📝 长文 (Essay)" },
                { value: "marketing", label: "🚀 软文推广 (Marketing)" },
                { value: "interview", label: "👨‍💼 面试题 (Interview)" },
                { value: "guide", label: "📚 指南 (Guide)" },
                { value: "humorous", label: "🤪 幽默风趣 (Humorous)" },
              ]}
            />
          </div>

          {/* 目标读者 & 关键词 (并排布局) */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, fontWeight: 500, fontSize: 13 }}>
                <UserOutlined style={{ marginRight: 4 }} />
                目标读者
              </div>
              <Input
                placeholder="例: 普通大众"
                value={config.audience}
                onChange={(e) =>
                  setConfig({ ...config, audience: e.target.value })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, fontWeight: 500, fontSize: 13 }}>
                <Tag color="blue" style={{ marginRight: 4 }}>
                  SEO
                </Tag>
                关键词
              </div>
              <Input
                placeholder="React, Next.js"
                value={config.keywords}
                onChange={(e) =>
                  setConfig({ ...config, keywords: e.target.value })
                }
              />
            </div>
          </div>

          {/* 篇幅长度 */}
          <div>
            <div style={{ marginBottom: 6, fontWeight: 500 }}>
              <ColumnWidthOutlined style={{ marginRight: 6 }} />
              篇幅长度
            </div>
            <Radio.Group
              value={config.length}
              onChange={(e) => setConfig({ ...config, length: e.target.value })}
              buttonStyle="solid"
              style={{ width: "100%", display: "flex" }}
            >
              <Radio.Button
                value="short"
                style={{ flex: 1, textAlign: "center" }}
              >
                短讯
              </Radio.Button>
              <Radio.Button
                value="medium"
                style={{ flex: 1, textAlign: "center" }}
              >
                标准
              </Radio.Button>
              <Radio.Button
                value="long"
                style={{ flex: 1, textAlign: "center" }}
              >
                深度
              </Radio.Button>
            </Radio.Group>
          </div>

          {/* 参考素材 */}
          <Collapse ghost size="small">
            <Panel
              header={
                <Space>
                  <FileTextOutlined />
                  <span>参考素材 / 上下文 (可选)</span>
                </Space>
              }
              key="1"
            >
              <TextArea
                placeholder="粘贴相关的背景资料、新闻段落或你的笔记，AI 将基于这些内容进行扩写..."
                rows={4}
                value={config.reference}
                onChange={(e) =>
                  setConfig({ ...config, reference: e.target.value })
                }
              />
            </Panel>
          </Collapse>

          <Divider style={{ margin: "12px 0" }} />

          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleGenerate}
            loading={loading}
            block
          >
            {loading ? "正在创作..." : "开始一键生成"}
          </Button>
        </Card>
      </div>

      <div className={styles.main}>
        <Card
          title="内容预览 ✨"
          variant={"borderless"}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
          styles={{
            header: {
              zIndex: 1,
              backdropFilter: "blur(20px)",
              position: "sticky",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            },
            body: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              padding: 0,
            },
          }}
          extra={
            <Space>
              {generatedRaw && (
                <Tag color="processing">{generatedRaw.length} 字</Tag>
              )}
              {generatedRaw && (
                <Tooltip title="复制内容">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={copyToClipboard}
                  />
                </Tooltip>
              )}
              <Tooltip title="清空">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setGeneratedRaw("")}
                />
              </Tooltip>
            </Space>
          }
        >
          <div ref={scrollContainerRef} style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {generatedRaw ? (
              <>
                <div ref={contentRef} className={styles.previewPaper}>
                  <div className={styles.markdownBody}>
                    <ReactMarkdown>{generatedRaw}</ReactMarkdown>
                    {loading && <span className={styles.cursor} />}
                  </div>
                </div>

                {!loading && (
                  <div
                    style={{
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: 16,
                      marginTop: 16,
                      textAlign: "right",
                    }}
                  >
                    <Space>
                      <Button
                        size="large"
                        onClick={() => {
                          setGeneratedRaw("");
                          handleGenerate().then();
                        }}
                      >
                        不满意，重写
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        onClick={handleUseContent}
                        style={{ background: "#52c41a", borderColor: "#52c41a" }}
                      >
                        预览满意，创建文章
                      </Button>
                    </Space>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <RobotOutlined className={styles.emptyIcon} />
                <Title level={5} type="secondary">
                  AI 创作空间
                </Title>
                <Text type="secondary">在左侧设置参数，开启你的灵感之旅</Text>
              </div>
            )}
          </div>
        </Card>
      </div>

      <AddContentModal
        isModalOpen={isModalOpen}
        isEditMode={false}
        editItem={null}
        initValues={modalData}
        onClose={() => setIsModalOpen(false)}
        showMessage={false}
        onSuccessCallback={() => {
          setIsModalOpen(false);
          messageApi.success("🎉 文章已成功创建！");
        }}
      />
    </div>
  );
}
