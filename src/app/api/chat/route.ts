import { NextRequest } from "next/server";
import { streamText, convertToModelMessages } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";

const deepSeek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: deepSeek("deepseek-chat"),
    messages: modelMessages,
    system: "你是一个高级程序员,请根据用户的问题给出答案",
  });

  return result.toUIMessageStreamResponse();
}
