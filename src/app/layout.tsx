import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";

const googleSansCode = localFont({
  src: "./fonts/GoogleSansCode[MONO,wght].ttf",
  variable: "--font-google-sans-code",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://choria.example.com"),
  title: {
    default: "Choria - AI-Powered Assistant Platform",
    template: "%s | Choria",
  },
  description:
    "一站式 AI 智能平台，整合 DeepSeek 驱动的对话助手与宝可梦图鉴等实用工具",
  keywords: [
    "AI",
    "assistant",
    "chat",
    "DeepSeek",
    "pokemon",
    "智能助手",
    "AI对话",
  ],
  authors: [{ name: "Choria" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Choria - AI-Powered Assistant Platform",
    description:
      "一站式 AI 智能平台，整合 DeepSeek 驱动的对话助手与宝可梦图鉴等实用工具",
    type: "website",
    siteName: "Choria",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Choria - AI-Powered Assistant Platform",
    description:
      "一站式 AI 智能平台，整合 DeepSeek 驱动的对话助手与宝可梦图鉴等实用工具",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${googleSansCode.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <main className="flex-1">{children}</main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
