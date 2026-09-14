import { describe, expect, it } from "vitest";

import { outputFileName, stripExtension } from "@/tools/image-converter/naming";

describe("stripExtension", () => {
  it("drops the last extension", () => {
    expect(stripExtension("photo.png")).toBe("photo");
  });

  it("keeps earlier dots", () => {
    expect(stripExtension("holiday.2026.jpg")).toBe("holiday.2026");
  });

  it("leaves a name without an extension alone", () => {
    expect(stripExtension("photo")).toBe("photo");
  });

  it("leaves a dotfile alone", () => {
    expect(stripExtension(".gitignore")).toBe(".gitignore");
  });
});

describe("outputFileName", () => {
  const none = new Set<string>();

  it("replaces the extension of the source name", () => {
    expect(outputFileName("photo.png", "webp", none)).toBe("photo.webp");
  });

  it("adds an extension to a name that has none", () => {
    expect(outputFileName("photo", "webp", none)).toBe("photo.webp");
  });

  it("treats the jpeg extension as jpg", () => {
    expect(outputFileName("photo.jpeg", "jpg", none)).toBe("photo.jpg");
  });

  it("suffixes a name that is already taken", () => {
    expect(outputFileName("photo.png", "webp", new Set(["photo.webp"]))).toBe("photo-1.webp");
  });

  it("keeps counting past the first collision", () => {
    const taken = new Set(["photo.webp", "photo-1.webp", "photo-2.webp"]);
    expect(outputFileName("photo.png", "webp", taken)).toBe("photo-3.webp");
  });

  it("treats names that differ only in case as taken", () => {
    expect(outputFileName("PHOTO.png", "webp", new Set(["photo.webp"]))).toBe("PHOTO-1.webp");
  });

  it("gives two sources with different extensions distinct outputs", () => {
    const taken = new Set<string>();
    const first = outputFileName("photo.png", "webp", taken);
    taken.add(first.toLowerCase());
    const second = outputFileName("photo.jpg", "webp", taken);

    expect(first).toBe("photo.webp");
    expect(second).toBe("photo-1.webp");
  });
});
