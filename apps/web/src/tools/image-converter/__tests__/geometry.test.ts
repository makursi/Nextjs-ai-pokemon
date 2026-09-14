import { describe, expect, it } from "vitest";

import { fitWithin, rotateSize, targetSize } from "@/tools/image-converter/geometry";

describe("fitWithin", () => {
  it("scales a landscape image down to the longest edge", () => {
    expect(fitWithin(4000, 2000, 1000)).toEqual({ width: 1000, height: 500 });
  });

  it("scales a portrait image down to the longest edge", () => {
    expect(fitWithin(2000, 4000, 1000)).toEqual({ width: 500, height: 1000 });
  });

  it("never scales an image up", () => {
    expect(fitWithin(500, 400, 1000)).toEqual({ width: 500, height: 400 });
  });

  it("keeps at least one pixel in each dimension", () => {
    expect(fitWithin(10000, 3, 100)).toEqual({ width: 100, height: 1 });
  });

  it("leaves a square image square", () => {
    expect(fitWithin(3000, 3000, 600)).toEqual({ width: 600, height: 600 });
  });
});

describe("rotateSize", () => {
  it("swaps the dimensions at a quarter turn", () => {
    expect(rotateSize(10, 5, 90)).toEqual({ width: 5, height: 10 });
    expect(rotateSize(10, 5, 270)).toEqual({ width: 5, height: 10 });
  });

  it("keeps the dimensions at half a turn", () => {
    expect(rotateSize(10, 5, 180)).toEqual({ width: 10, height: 5 });
    expect(rotateSize(10, 5, 0)).toEqual({ width: 10, height: 5 });
  });
});

describe("targetSize", () => {
  it("returns the source size when nothing is asked for", () => {
    expect(targetSize(4000, 2000, { maxEdge: null, rotate: 0 })).toEqual({
      width: 4000,
      height: 2000,
    });
  });

  it("fits after rotating, not before", () => {
    // Rotating first makes the long edge the height, so both sides change.
    expect(targetSize(4000, 2000, { maxEdge: 1000, rotate: 90 })).toEqual({
      width: 500,
      height: 1000,
    });
  });

  it("applies the longest edge to the rotated image", () => {
    expect(targetSize(4000, 2000, { maxEdge: 500, rotate: 0 })).toEqual({
      width: 500,
      height: 250,
    });
  });
});
