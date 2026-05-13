"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { BotIcon, UserIcon, SendIcon, Loader2Icon } from "lucide-react";

export default function ChatPanel() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 pt-20">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <BotIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">AI 对话助手</p>
                <p className="text-sm text-muted-foreground mt-1">
                  由 DeepSeek 驱动，开始对话吧
                </p>
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback>
                  {m.role === "user" ? (
                    <UserIcon className="size-4" />
                  ) : (
                    <BotIcon className="size-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <Card
                className={`max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : ""}`}
                size="sm"
              >
                <CardContent className="p-3">
                  <p className="whitespace-pre-wrap text-sm">
                    {m.parts
                      .filter((p) => p.type === "text")
                      .map((p) => p.text)
                      .join("")}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">思考中...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-background p-4"
      >
        <div className="mx-auto max-w-2xl flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon-sm">
            {isLoading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SendIcon className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
