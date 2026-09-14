/**
 * Sizing maths, kept pure so it can be tested without a canvas.
 *
 * Rotation happens before scaling, so a rotated image is fitted by its real
 * longest edge rather than the pre-rotation one.
 */
export type Size = { width: number; height: number };

export type Rotation = 0 | 90 | 180 | 270;

export type ResizeRequest = {
  /** Longest edge of the output, or `null` to keep the source size. */
  maxEdge: number | null;
  rotate: Rotation;
};

/** Scale down so the longest edge is `maxEdge`. Never scales up. */
export function fitWithin(width: number, height: number, maxEdge: number): Size {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };

  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** The size of the image once rotated by a quarter-turn multiple. */
export function rotateSize(width: number, height: number, rotate: Rotation): Size {
  return rotate === 90 || rotate === 270 ? { width: height, height: width } : { width, height };
}

/** The size to decode and encode at, given what the Batch asked for. */
export function targetSize(width: number, height: number, request: ResizeRequest): Size {
  const rotated = rotateSize(width, height, request.rotate);
  if (request.maxEdge === null) return rotated;

  return fitWithin(rotated.width, rotated.height, request.maxEdge);
}
