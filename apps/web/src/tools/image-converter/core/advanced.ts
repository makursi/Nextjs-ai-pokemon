import type { ImageFormat } from "./formats";

/**
 * The codec knobs the Advanced panel exposes.
 *
 * Ranges come from each codec's own documentation rather than from a slider
 * that looked reasonable: libavif's `speed` is 0-10, libwebp's `method` 0-6,
 * oxipng's `level` 0-6, and mozjpeg's `quant_table` 0-8. The defaults are the
 * ones the codecs ship with, so leaving the panel closed changes nothing.
 */
export type AdvancedField =
  | {
      key: string;
      label: string;
      kind: "number";
      min: number;
      max: number;
      step: number;
      initial: number;
    }
  | { key: string; label: string; kind: "boolean"; initial: boolean };

export const advancedFields: Partial<Record<ImageFormat, AdvancedField[]>> = {
  jpeg: [
    { key: "progressive", label: "渐进式扫描", kind: "boolean", initial: true },
    {
      key: "quant_table",
      label: "量化表（0-8）",
      kind: "number",
      min: 0,
      max: 8,
      step: 1,
      initial: 3,
    },
  ],
  webp: [
    {
      key: "method",
      label: "压缩力度（0-6）",
      kind: "number",
      min: 0,
      max: 6,
      step: 1,
      initial: 4,
    },
    {
      key: "alpha_quality",
      label: "透明通道质量（0-100）",
      kind: "number",
      min: 0,
      max: 100,
      step: 1,
      initial: 100,
    },
  ],
  avif: [
    {
      key: "speed",
      label: "速度（0-10，越慢文件越小）",
      kind: "number",
      min: 0,
      max: 10,
      step: 1,
      initial: 6,
    },
    {
      key: "denoiseLevel",
      label: "降噪（0-50）",
      kind: "number",
      min: 0,
      max: 50,
      step: 1,
      initial: 0,
    },
    {
      key: "subsample",
      label: "色度抽样（0-3）",
      kind: "number",
      min: 0,
      max: 3,
      step: 1,
      initial: 1,
    },
  ],
  bmp: [],
  png: [
    {
      key: "level",
      label: "OxiPNG 优化级别（0-6）",
      kind: "number",
      min: 0,
      max: 6,
      step: 1,
      initial: 2,
    },
  ],
};
