import type { Metadata } from "next";
import { Suspense } from "react";
import ChatPanel from "@/components/chat-panel";

export const metadata: Metadata = {
  title: "AI 对话",
  description: "Choria AI 对话 - 由 DeepSeek 驱动的智能对话助手",
};

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPanel />
    </Suspense>
  )
}
