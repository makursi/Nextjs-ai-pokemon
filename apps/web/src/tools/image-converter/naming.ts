/**
 * Output file names.
 *
 * A Batch converts many files into the same target format, so two sources can
 * want the same output name. Names are compared case-insensitively because the
 * result is usually unzipped onto a case-insensitive filesystem.
 */

/** `photo.png` → `photo`; a name with no extension, or a dotfile, is unchanged. */
export function stripExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot <= 0 ? fileName : fileName.slice(0, dot);
}

/** The name `sourceName` should get when encoded as `extension`, avoiding `taken`. */
export function outputFileName(
  sourceName: string,
  extension: string,
  taken: ReadonlySet<string>,
): string {
  const base = stripExtension(sourceName);
  const first = `${base}.${extension}`;
  if (!isTaken(first, taken)) return first;

  for (let suffix = 1; ; suffix += 1) {
    const candidate = `${base}-${suffix}.${extension}`;
    if (!isTaken(candidate, taken)) return candidate;
  }
}

/** Callers keep `taken` lower-cased; this is the only place the convention is read. */
function isTaken(name: string, taken: ReadonlySet<string>): boolean {
  return taken.has(name.toLowerCase());
}
