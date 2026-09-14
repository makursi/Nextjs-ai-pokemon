import { describe, expect, it } from "vitest";

import { formatSpecs, imageFormats } from "@/tools/image-converter/formats";
import { resolveEncodeOptions } from "@/tools/image-converter/options";

describe("the format table", () => {
  it("lists every format exactly once", () => {
    expect(imageFormats).toHaveLength(Object.keys(formatSpecs).length);
    expect(new Set(imageFormats).size).toBe(imageFormats.length);
  });

  it("gives every format a distinct mime type and extension", () => {
    const mimes = imageFormats.map((format) => formatSpecs[format].mime);
    const extensions = imageFormats.map((format) => formatSpecs[format].extension);

    expect(new Set(mimes).size).toBe(mimes.length);
    expect(new Set(extensions).size).toBe(extensions.length);
  });

  it("marks the formats that cannot carry alpha", () => {
    expect(formatSpecs.jpeg.alpha).toBe(false);
    expect(formatSpecs.bmp.alpha).toBe(false);
    expect(formatSpecs.png.alpha).toBe(true);
    expect(formatSpecs.webp.alpha).toBe(true);
    expect(formatSpecs.avif.alpha).toBe(true);
  });

  it("marks which formats can go lossless", () => {
    expect(formatSpecs.png.lossless).toBe("always");
    expect(formatSpecs.bmp.lossless).toBe("always");
    expect(formatSpecs.webp.lossless).toBe("optional");
    expect(formatSpecs.avif.lossless).toBe("optional");
    expect(formatSpecs.jpeg.lossless).toBe("never");
  });
});

describe("resolveEncodeOptions", () => {
  it("passes quality through to JPEG", () => {
    expect(resolveEncodeOptions({ format: "jpeg", quality: 62, lossless: false })).toEqual({
      quality: 62,
    });
  });

  it("switches libwebp to its lossless mode", () => {
    expect(resolveEncodeOptions({ format: "webp", quality: 62, lossless: true })).toEqual({
      lossless: 1,
    });
  });

  it("ignores lossless for JPEG", () => {
    expect(resolveEncodeOptions({ format: "jpeg", quality: 62, lossless: true })).toEqual({
      quality: 62,
    });
  });

  it("normalises the AVIF lossless triple", () => {
    // jSquash warns unless quality/qualityAlpha/subsample are forced together.
    expect(resolveEncodeOptions({ format: "avif", quality: 40, lossless: true })).toEqual({
      lossless: true,
      quality: 100,
      qualityAlpha: -1,
      subsample: 3,
    });
  });

  it("passes quality through to AVIF when lossy", () => {
    expect(resolveEncodeOptions({ format: "avif", quality: 40, lossless: false })).toEqual({
      quality: 40,
    });
  });

  it("has no options for the formats it encodes itself", () => {
    expect(resolveEncodeOptions({ format: "png", quality: 40, lossless: true })).toEqual({});
    expect(resolveEncodeOptions({ format: "bmp", quality: 40, lossless: false })).toEqual({});
  });

  it("lets advanced options override the defaults", () => {
    expect(
      resolveEncodeOptions({
        format: "avif",
        quality: 40,
        lossless: false,
        advanced: { speed: 2, subsample: 3 },
      }),
    ).toEqual({ quality: 40, speed: 2, subsample: 3 });
  });
});
