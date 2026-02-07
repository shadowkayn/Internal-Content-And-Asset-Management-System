import OpenAI from "openai";

// 直接使用官方 OpenAI 客户端连接 DeepSeek
// 这样可以完全掌控 API 地址，不会被 SDK 乱改
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://open.bigmodel.cn/api/paas/v4/", // 智谱 AI 的官方地址
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // 检查 Key (调试用)
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error("❌ 错误: 环境变量 DEEPSEEK_API_KEY 未找到");
      return new Response("API Key missing", { status: 500 });
    }

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    // 发起请求 (原生写法)
    const response = await client.chat.completions.create({
      // 智谱最推荐的免费/高性能模型
      model: "glm-4-flash",
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的、精通排版的内容创作者。请务必直接输出 Markdown 格式的内容，第一行必须是文章标题（以#开头），不要包含任何“好的”、“当然”等废话。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true, // 开启流
      temperature: 0.7,
    });

    // 将 OpenAI 的流转换为 Web 标准的 ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              // 把文本编码后推送到流里
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error("Stream Error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    // 4. 返回流
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: any) {
    console.error("❌ API Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
