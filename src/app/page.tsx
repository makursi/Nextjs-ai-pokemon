import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageCircleIcon, SwordsIcon, ArrowRightIcon, SparklesIcon } from "lucide-react"

const features = [
  {
    icon: MessageCircleIcon,
    title: "AI 对话",
    description: "由 DeepSeek 驱动的智能对话助手",
  },
  {
    icon: SwordsIcon,
    title: "宝可梦查询",
    description: "查询宝可梦详细信息与图鉴",
  },
]

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center">
      <section className="flex flex-col items-center justify-center gap-8 py-24 px-6 w-full max-w-3xl">
        <Badge variant="secondary">
          <SparklesIcon data-icon="inline-start" />
          Choria Platform
        </Badge>
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Choria
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            一站式 AI 智能平台，整合对话助手与实用工具
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard">
            开始使用
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </section>

      <Separator className="max-w-3xl w-full" />

      <section className="grid sm:grid-cols-2 gap-4 py-16 px-6 w-full max-w-3xl">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} size="sm">
            <CardHeader>
              <Icon className="size-6 text-muted-foreground" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}