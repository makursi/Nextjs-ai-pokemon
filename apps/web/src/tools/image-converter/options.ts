import type { ImageFormat } from "./formats";

/**
 * The quality setting, in the shape each codec expects.
 *
 * Every encoder is justified here rather than at the call site: AVIF warns at
 * runtime unless the lossless triple is forced together, and WebP spells
 * lossless as a number while AVIF spells it as a boolean.
 */
export type TargetSettings = {
  format: ImageFormat;
  /** 0-100, used by the lossy targets. */
  quality: number;
  lossless: boolean;
  /** Raw codec options from the Advanced panel, merged over the defaults. */
  advanced?: Record<string, number | boolean>;
};

export type EncodeOptions = Record<string, number | boolean>;

export function resolveEncodeOptions({
  format,
  quality,
  lossless,
  advanced,
}: TargetSettings): EncodeOptions {
  return { ...defaultOptions(format, quality, lossless), ...advanced };
}

function defaultOptions(format: ImageFormat, quality: number, lossless: boolean): EncodeOptions {
  switch (format) {
    case "jpeg":
      return { quality };
    case "webp":
      return lossless ? { lossless: 1 } : { quality };
    case "avif":
      return lossless
        ? { lossless: true, quality: 100, qualityAlpha: -1, subsample: 3 }
        : { quality };
    case "png":
    case "bmp":
      // Encoded without a codec that takes quality: PNG by canvas (and oxipng
      // for optimisation), BMP by the hand-written encoder.
      return {};
    default:
      throw new Error(`No encoder options for ${String(format)}`);
  }
}
