"use client"

import { useState } from "react"
import Link from "next/link"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  MessageCircleIcon,
  SwordsIcon,
  HomeIcon,
} from "lucide-react"
import ChatPanel from "@/components/chat-panel"
import { PokemonList } from "@/components/pokemon-list"

type Module = "chat" | "pokemon"

const menuItems: { id: Module; label: string; icon: typeof MessageCircleIcon }[] = [
  { id: "chat", label: "AI 对话", icon: MessageCircleIcon },
  { id: "pokemon", label: "宝可梦查询", icon: SwordsIcon },
]

export function DashboardContent() {
  const [activeModule, setActiveModule] = useState<Module>("chat")

  return (
    <TooltipProvider>
      <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <HomeIcon className="size-4" />
                  </div>
                  <span className="font-semibold">Choria</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Separator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>功能模块</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map(({ id, label, icon: Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={activeModule === id}
                      onClick={() => setActiveModule(id)}
                      tooltip={label}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex flex-1 flex-col">
        <div className="flex h-14 items-center gap-4 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-sm font-medium">
            {menuItems.find((m) => m.id === activeModule)?.label}
          </h1>
        </div>
        <div className="flex-1">
          {activeModule === "chat" ? <ChatPanel /> : <div className="p-6"><PokemonList /></div>}
        </div>
      </main>
    </SidebarProvider>
    </TooltipProvider>
  )
}
