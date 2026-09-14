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
            <Link className="block" href={toolPath(tool.slug)} key={tool.slug}>
              {/*
                The Link wraps the Card rather than sitting inside it, so the
                whole card is the click target. Mantine's polymorphic
                `component` prop would be the other way to do this, but it cannot
                be handed a function across the Server Component boundary — the
                build rejects it.
              */}
              <Card padding="md" withBorder>
                <Anchor component="span" fw={500} underline="hover">
                  {tool.title}
                </Anchor>
                <Text c="dimmed" mt={4} size="sm">
                  {tool.description}
                </Text>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
