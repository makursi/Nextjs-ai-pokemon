import { Box, Container, Flex, Paper, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import { siteDescription, siteName } from "@/lib/site";
import { toolPath, tools } from "@/tools/registry";
import type { ToolMeta } from "@/tools/types";

export default function HomePage() {
  return (
    <Container className="py-12 sm:py-24" size="md">
      <Stack className="gap-10 sm:gap-14">
        <header className="reveal">
          <Title order={1}>{siteName}</Title>
          <Text c="dimmed" maw={560} mt="sm" size="lg">
            {siteDescription}
          </Text>
        </header>

        <section className="reveal reveal-second">
          {tools.length === 0 ? (
            <Text c="dimmed" size="sm">
              还没有工具。
            </Text>
          ) : (
            /*
             * One full-width card per Tool, stacked rather than gridded. A grid
             * would leave an empty cell with a single Tool in it, which reads as
             * a layout mistake; this shape stays honest as Tools are added and
             * becomes a grid the day it looks cramped.
             */
            <Stack gap="md">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </Stack>
          )}
        </section>
      </Stack>
    </Container>
  );
}

function ToolCard({ tool }: { tool: ToolMeta }) {
  return (
    <Link href={toolPath(tool.slug)} style={{ color: "inherit", textDecoration: "none" }}>
      <Paper className="lift" p="lg" radius="md" withBorder>
        <Flex direction={{ base: "column", sm: "row" }} gap="lg">
          {/*
            TODO: cover image, 4:3, at least 660x495.
            Drop it at apps/web/public/tools/<slug>/cover.jpg and set `cover` in
            that Tool's meta.ts. The frame is reserved either way so the card does
            not reflow the day it lands, and nothing invented is drawn in it.
          */}
          <Box
            style={{
              aspectRatio: "4 / 3",
              backgroundColor: "var(--mantine-color-default)",
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: "var(--mantine-radius-sm)",
              flexShrink: 0,
              overflow: "hidden",
              position: "relative",
              width: "100%",
            }}
            w={{ base: "100%", sm: 220 }}
          >
            {tool.cover ? (
              /* Decorative: the card's text already names the Tool. */
              <Image
                alt=""
                fill
                sizes="(min-width: 640px) 220px, 100vw"
                src={tool.cover}
                style={{ objectFit: "cover" }}
              />
            ) : null}
          </Box>

          <Stack gap="xs">
            <Text fw={500} size="lg">
              {tool.title}
            </Text>
            <Text c="dimmed">{tool.description}</Text>
            <Text mt="xs" size="sm">
              打开 <span aria-hidden="true">→</span>
            </Text>
          </Stack>
        </Flex>
      </Paper>
    </Link>
  );
}
