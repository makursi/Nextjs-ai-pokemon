import type { ImageFormat } from "./formats";

/**
 * What an uploaded file actually is.
 *
 * `heic` is not a format this Tool converts — it is a distinct answer so the UI
 * can say "HEIC is not supported" instead of "unknown file".
 */
export type SniffedFormat = ImageFormat | "heic";

const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const avifBrands = new Set(["avif", "avis", "avio"]);
// mif1/msf1 are generic HEIF brands; they only mean HEIC when no AVIF brand is present.
const heicBrands = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
  "mif1",
  "msf1",
]);

/**
 * Read the format from the file's leading bytes.
 *
 * Extensions lie: iOS hands out HEIC files named `.jpg`, and people rename
 * things. HEIC and AVIF share the ISO-BMFF container, so their `ftyp` brands
 * are the only thing that tells them apart.
 */
export function sniffFormat(bytes: Uint8Array): SniffedFormat | null {
  if (startsWith(bytes, pngSignature)) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return "bmp";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return "webp";
  if (ascii(bytes, 4, 4) === "ftyp") return sniffIsoBmff(bytes);

  return null;
}

function sniffIsoBmff(bytes: Uint8Array): SniffedFormat | null {
  const brands = new Set<string>();
  // The major brand sits at 8; compatible brands follow in 4-byte groups. The
  // box size at 0 bounds the scan, and a generous cap keeps a malformed header
  // from being read as an endless brand list.
  const boxSize = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
  const end = Math.min(bytes.length, boxSize === 0 ? bytes.length : boxSize, 8 + 64);

  for (let offset = 8; offset + 4 <= end; offset += 4) {
    const brand = ascii(bytes, offset, 4);
    if (brand) brands.add(brand);
  }

  if ([...brands].some((brand) => avifBrands.has(brand))) return "avif";
  if ([...brands].some((brand) => heicBrands.has(brand))) return "heic";

  return null;
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte);
}

function ascii(bytes: Uint8Array, offset: number, length: number): string | null {
  if (offset + length > bytes.length) return null;

  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}
