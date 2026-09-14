import { formatSpecs, type ImageFormat } from "./formats";

/**
 * The quality setting, in the shape each codec expects.
 *
 * Every encoder is justified here rather than at the call site: WebP spells
 * lossless as a number while AVIF spells it as a boolean, AVIF warns unless its
 * lossless values move together, and JPEG has no lossless mode at all.
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
  // The format table decides whether lossless means anything here: asking JPEG
  // for a lossless encode is not an error, it is simply the quality path.
  const wantsLossless = lossless && formatSpecs[format].lossless !== "never";
  const base = wantsLossless ? {} : qualityOptions(format, quality);

  if (!wantsLossless) return { ...base, ...advanced };

  // Lossless is a mode, not a knob. Applied last so the Advanced panel cannot
  // pull AVIF's quality/qualityAlpha/subsample apart — the combination libavif
  // warns about, and silently writes a lossy file for.
  return { ...base, ...advanced, ...losslessOptions(format) };
}

function qualityOptions(format: ImageFormat, quality: number): EncodeOptions {
  switch (format) {
    case "jpeg":
    case "webp":
    case "avif":
      return { quality };
    case "png":
    case "bmp":
      // Encoded without a codec that takes quality: PNG by canvas (and oxipng
      // for optimisation), BMP by the hand-written encoder.
      return {};
    default:
      throw new Error(`No encoder options for ${String(format)}`);
  }
}

function losslessOptions(format: ImageFormat): EncodeOptions {
  switch (format) {
    case "webp":
      return { lossless: 1 };
    case "avif":
      return { lossless: true, quality: 100, qualityAlpha: -1, subsample: 3 };
    case "jpeg":
    case "png":
    case "bmp":
      return {};
    default:
      throw new Error(`No lossless mode for ${String(format)}`);
  }
}
