import type { Metadata } from "next";

import { ImageConverter } from "@/tools/image-converter/ImageConverter";
import { meta } from "@/tools/image-converter/meta";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function ImageConverterPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{meta.title}</h1>
      <p className="mt-2 text-muted-foreground">{meta.description}</p>

      <ImageConverter />
    </main>
  );
}
