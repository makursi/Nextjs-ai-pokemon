import { Suspense } from "react"
import ChatPanel from "@/components/chat-panel"

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPanel />
    </Suspense>
  )
}
