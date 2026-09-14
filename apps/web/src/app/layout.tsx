import { Box, ColorSchemeScript, Container, mantineHtmlProps, Text } from "@mantine/core";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import { siteDescription, siteName, siteUrl } from "@/lib/site";

import { Providers } from "./providers";

import "./globals.css";

// Self-hosted at build time: `next/font` downloads these and serves them from
// this origin, so the no-outbound-requests policy in next.config.ts still holds.
const geistSans = Geist({ display: "swap", subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    // A pipe rather than a middle dot: it is the conventional separator in a
    // Chinese UI, and the middle dot is rationed by the design rules.
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable}`}
      lang="zh-CN"
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}

/**
 * A slim header holding the logo and nothing else.
 *
 * There is no navigation to build yet (one Tool, two pages), so this is the way
 * home rather than a menu with one item in it. Height stays well under the 80px
 * ceiling, and it does not stick: with this little content a sticky bar would
 * cost attention it cannot pay back.
 */
function SiteHeader() {
  return (
    <Box
      component="header"
      style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
    >
      <Container py="md" size="md">
        {/*
          The wordmark stands in for the logo until there is one. See the Assets
          section of the README: replacing this with the real mark is meant to be
          a one-line change, and no stand-in graphic is drawn in the meantime.
        */}
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
          <Text fw={600}>{siteName}</Text>
        </Link>
      </Container>
    </Box>
  );
}
