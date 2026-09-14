import { describe, expect, it } from "vitest";

import type { ImageFormat } from "@/tools/image-converter/core/formats";
import type { TargetSettings } from "@/tools/image-converter/core/options";
import { planConversions } from "@/tools/image-converter/core/plan";

function target(format: ImageFormat): TargetSettings {
  return { format, quality: 75, lossless: false };
}

describe("planConversions", () => {
  it("plans one Conversion per source and enabled target", () => {
    const planned = planConversions(["a.png", "b.png"], [target("webp"), target("avif")]);

    expect(planned).toHaveLength(4);
    expect(planned.map((entry) => entry.outputName)).toEqual([
      "a.webp",
      "a.avif",
      "b.webp",
      "b.avif",
    ]);
  });

  it("plans nothing when no target is enabled", () => {
    expect(planConversions(["a.png"], [])).toEqual([]);
  });

  it("keeps the order the sources were added in", () => {
    const planned = planConversions(["first.png", "second.png"], [target("jpeg")]);

    expect(planned.map((entry) => entry.sourceName)).toEqual(["first.png", "second.png"]);
  });

  it("keeps two sources with the same base name apart", () => {
    const planned = planConversions(["photo.png", "photo.jpg"], [target("webp")]);

    expect(planned.map((entry) => entry.outputName)).toEqual(["photo.webp", "photo-1.webp"]);
  });

  it("numbers the Conversions so a Worker response can be matched", () => {
    const planned = planConversions(["a.png", "b.png"], [target("png")]);

    expect(planned.map((entry) => entry.id)).toEqual([0, 1]);
  });

  it("remembers which source file each Conversion came from", () => {
    const planned = planConversions(["a.png", "b.png"], [target("webp")]);

    expect(planned.map((entry) => entry.sourceIndex)).toEqual([0, 1]);
  });
});
