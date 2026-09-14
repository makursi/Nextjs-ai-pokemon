/**
 * How much work one file may cost before the browser falls over.
 *
 * Every Tool runs in a tab, so an unbounded batch is a way to freeze the page
 * rather than a way to convert images. The byte limit is checked before
 * decoding; the pixel limit can only be checked once the file has been decoded,
 * because browsers disagree about what a canvas does past its area limit
 * (throw, blank, or clamp) and refusing early is the only behaviour that is the
 * same everywhere.
 */
export type Limits = {
  maxBytes: number;
  maxPixels: number;
};

export const defaultLimits: Limits = {
  maxBytes: 100 * 1024 * 1024,
  maxPixels: 268_435_456,
};

export type LimitFailure = {
  ok: false;
  reason: "too-large" | "too-many-pixels";
  message: string;
};

export type LimitResult = { ok: true } | LimitFailure;

/** Dimensions are optional: they are only known once the file has been decoded. */
export function checkLimits(
  input: { bytes?: number; width?: number; height?: number },
  limits: Limits = defaultLimits,
): LimitResult {
  if (input.bytes !== undefined && input.bytes > limits.maxBytes) {
    return {
      ok: false,
      reason: "too-large",
      message: `This file is ${megabytes(input.bytes)} MB; the limit is ${megabytes(limits.maxBytes)} MB.`,
    };
  }

  if (input.width !== undefined && input.height !== undefined) {
    const pixels = input.width * input.height;
    if (pixels > limits.maxPixels) {
      return {
        ok: false,
        reason: "too-many-pixels",
        message: `This image is ${input.width}×${input.height} pixels; the limit is ${Math.round(
          limits.maxPixels / 1_000_000,
        )} megapixels.`,
      };
    }
  }

  return { ok: true };
}

function megabytes(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}
