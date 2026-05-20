import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard-content";

export const metadata: Metadata = {
  title: "控制台",
  description: "Choria 控制台 - 管理您的 AI 对话与宝可梦查询",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
