import { Zip, ZipPassThrough } from "fflate";

/**
 * Zip the outputs of a Batch.
 *
 * The entries are already-compressed images, so deflating them again would cost
 * time and save nothing: they are stored as-is and streamed out through
 * `fflate`'s `Zip` rather than assembled as one big buffer.
 */
export function zipConversions(entries: readonly { name: string; bytes: Uint8Array }[]): Blob {
  const chunks: BlobPart[] = [];
  const archive = new Zip((error, chunk) => {
    if (error) throw error;
    chunks.push(chunk);
  });

  for (const entry of entries) {
    const file = new ZipPassThrough(entry.name);
    archive.add(file);
    file.push(entry.bytes, true);
  }

  archive.end();

  return new Blob(chunks, { type: "application/zip" });
}
