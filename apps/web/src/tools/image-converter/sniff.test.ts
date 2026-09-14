import { describe, expect, it } from "vitest";

import { sniffFormat } from "@/tools/image-converter/sniff";

function asciiBytes(text: string): number[] {
  const result: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    result.push(text.charCodeAt(index));
  }

  return result;
}

function bytes(...values: (number | string)[]): Uint8Array {
  return Uint8Array.from(
    values.flatMap((value) => (typeof value === "string" ? asciiBytes(value) : [value])),
  );
}

/** An ISO-BMFF header: 4-byte box size, "ftyp", then the major brand. */
function isobmff(...brands: string[]): Uint8Array {
  return bytes(0, 0, 0, 24, "ftyp", ...brands.flatMap((brand) => asciiBytes(brand)), 0, 0, 0, 0);
}

describe("sniffFormat", () => {
  it("recognises PNG from its signature", () => {
    expect(sniffFormat(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
  });

  it("recognises JPEG from its start-of-image marker", () => {
    expect(sniffFormat(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpeg");
  });

  it("recognises BMP from its 'BM' signature", () => {
    expect(sniffFormat(bytes("BM", 0x36, 0x00))).toBe("bmp");
  });

  it("recognises WebP from the RIFF container and its form type", () => {
    expect(sniffFormat(bytes("RIFF", 0x1a, 0x00, 0x00, 0x00, "WEBP"))).toBe("webp");
  });

  it("recognises AVIF from an ISO-BMFF container with the avif brand", () => {
    expect(sniffFormat(isobmff("avif"))).toBe("avif");
  });

  it("recognises AVIF when avif is only a compatible brand", () => {
    expect(sniffFormat(isobmff("mif1", "avif"))).toBe("avif");
  });

  it("reports HEIC as heic rather than as AVIF", () => {
    expect(sniffFormat(isobmff("heic"))).toBe("heic");
    expect(sniffFormat(isobmff("mif1", "heix"))).toBe("heic");
  });

  it("does not mistake a RIFF file that is not WebP", () => {
    expect(sniffFormat(bytes("RIFF", 0x1a, 0x00, 0x00, 0x00, "WAVE"))).toBeNull();
  });

  it("returns null for an unknown signature", () => {
    expect(sniffFormat(bytes("GIF89a"))).toBeNull();
  });

  it("returns null when the file is too short to identify", () => {
    expect(sniffFormat(bytes(0x89))).toBeNull();
    expect(sniffFormat(new Uint8Array(0))).toBeNull();
  });
});
