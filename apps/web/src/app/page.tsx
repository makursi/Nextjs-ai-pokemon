import { Anchor, Card, Container, SimpleGrid, Text, Title } from "@mantine/core";
import Link from "next/link";

import { siteDescription, siteName } from "@/lib/site";
import { toolPath, tools } from "@/tools/registry";

export default function HomePage() {
  return (
    <Container size="md" py="xl">
      <Title order={1}>{siteName}</Title>
      <Text c="dimmed" mt="xs">
        {siteDescription}
      </Text>

      {tools.length === 0 ? (
        <Text c="dimmed" mt="xl" size="sm">
          No tools yet.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
          {tools.map((tool) => (
            <Card key={tool.slug} padding="md" withBorder>
              {/*
                `next/link` stays the element that navigates — this page is a
                Server Component, and handing Mantine's polymorphic `component`
                prop a function across that boundary is not allowed. The Anchor
                is only here for its styling.
              */}
              <Link href={toolPath(tool.slug)}>
                <Anchor component="span" fw={500} underline="never">
                  {tool.title}
                </Anchor>
              </Link>
              <Text c="dimmed" mt={4} size="sm">
                {tool.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
