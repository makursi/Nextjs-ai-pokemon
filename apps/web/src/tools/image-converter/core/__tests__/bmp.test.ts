import { describe, expect, it } from "vitest";

import { encodeBmp } from "@/tools/image-converter/core/bmp";

/** Two pixels wide, one row: row size is 8 with 2 bytes of padding. */
const twoByTwo = {
  width: 2,
  height: 2,
  data: Uint8ClampedArray.from([
    255,
    0,
    0,
    255, // red
    0,
    255,
    0,
    255, // green  (top row, left to right)
    0,
    0,
    255,
    255, // blue
    255,
    255,
    255,
    255, // white (bottom row)
  ]),
};

function header(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    signature: String.fromCharCode(view.getUint8(0), view.getUint8(1)),
    fileSize: view.getUint32(2, true),
    pixelOffset: view.getUint32(10, true),
    dibHeaderSize: view.getUint32(14, true),
    width: view.getInt32(18, true),
    height: view.getInt32(22, true),
    planes: view.getUint16(26, true),
    bitsPerPixel: view.getUint16(28, true),
    compression: view.getUint32(30, true),
    imageSize: view.getUint32(34, true),
  };
}

describe("encodeBmp", () => {
  it("writes a 24-bit uncompressed BITMAPINFOHEADER file", () => {
    const result = encodeBmp(twoByTwo);

    expect(header(result)).toEqual({
      signature: "BM",
      fileSize: 54 + 8 * 2,
      pixelOffset: 54,
      dibHeaderSize: 40,
      width: 2,
      height: 2,
      planes: 1,
      bitsPerPixel: 24,
      compression: 0,
      imageSize: 8 * 2,
    });
  });

  it("writes rows bottom-up, which is what BMP expects", () => {
    const result = encodeBmp(twoByTwo);

    // Bottom row first: blue then white, as BGR.
    expect(Array.from(result.slice(54, 60))).toEqual([255, 0, 0, 255, 255, 255]);
  });

  it("swaps red and blue for each pixel", () => {
    const result = encodeBmp({
      width: 1,
      height: 1,
      data: Uint8ClampedArray.from([10, 20, 30, 255]),
    });

    expect(Array.from(result.slice(54, 57))).toEqual([30, 20, 10]);
  });

  it("pads each row to a multiple of four bytes", () => {
    const result = encodeBmp({
      width: 3,
      height: 1,
      data: new Uint8ClampedArray(3 * 4),
    });

    // 3 pixels * 3 bytes = 9, padded to 12.
    expect(header(result).imageSize).toBe(12);
    expect(result.length).toBe(54 + 12);
  });

  it("drops alpha instead of writing a fourth channel", () => {
    const result = encodeBmp({
      width: 1,
      height: 1,
      data: Uint8ClampedArray.from([1, 2, 3, 0]),
    });

    expect(result.length).toBe(54 + 4);
  });
});
