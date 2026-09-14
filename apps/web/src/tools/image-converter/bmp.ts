/**
 * A 24-bit uncompressed BMP encoder — the one output format no browser can
 * produce and no WASM codec in the dependency set provides.
 *
 * BMP stores rows bottom-up and pixels as BGR, with each row padded to a
 * four-byte boundary; alpha is dropped because the 24-bit variant has nowhere
 * to put it.
 */
const fileHeaderSize = 14;
const dibHeaderSize = 40;
const pixelOffset = fileHeaderSize + dibHeaderSize;
/** 72 dots per inch, expressed the way BMP does: pixels per metre. */
const pixelsPerMetre = 2835;

export function encodeBmp(image: {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}): Uint8Array {
  const rowSize = (image.width * 3 + 3) & ~3;
  const pixelBytes = rowSize * image.height;
  const bytes = new Uint8Array(pixelOffset + pixelBytes);
  const view = new DataView(bytes.buffer);

  bytes[0] = 0x42;
  bytes[1] = 0x4d;
  view.setUint32(2, bytes.length, true);
  view.setUint32(10, pixelOffset, true);

  view.setUint32(14, dibHeaderSize, true);
  view.setInt32(18, image.width, true);
  /** Positive height means the rows are stored bottom-up. */
  view.setInt32(22, image.height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, pixelBytes, true);
  view.setInt32(38, pixelsPerMetre, true);
  view.setInt32(42, pixelsPerMetre, true);

  for (let row = 0; row < image.height; row += 1) {
    const sourceRow = image.height - 1 - row;
    let offset = pixelOffset + row * rowSize;

    for (let column = 0; column < image.width; column += 1) {
      const source = (sourceRow * image.width + column) * 4;
      bytes[offset] = channel(image.data, source + 2);
      bytes[offset + 1] = channel(image.data, source + 1);
      bytes[offset + 2] = channel(image.data, source);
      offset += 3;
    }
  }

  return bytes;
}

/** Reads a byte the loop bounds have already guaranteed exists. */
function channel(data: Uint8ClampedArray, index: number): number {
  return data.at(index) ?? 0;
}
