import { Container, Stack, Text, Title } from "@mantine/core";
import type { Metadata } from "next";

import { ImageConverter } from "@/tools/image-converter/ImageConverter";
import { meta } from "@/tools/image-converter/meta";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function ImageConverterPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xs">
        <Title order={1}>{meta.title}</Title>
        <Text c="dimmed">{meta.description}</Text>
      </Stack>

      <ImageConverter />
    </Container>
  );
}
