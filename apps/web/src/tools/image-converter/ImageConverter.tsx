"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { advancedFields, type AdvancedField } from "./advanced";
import { ConversionPool, type Outcome } from "./converter";
import { formatSpecs, imageFormats, type ImageFormat } from "./formats";
import type { Rotation } from "./geometry";
import { checkLimits } from "./limits";
import type { TargetSettings } from "./options";
import { planConversions, type PlannedConversion } from "./plan";
import { sniffByteLength, sniffFormat } from "./sniff";
import { zipConversions } from "./zip";

/**
 * The image converter, client-side by necessity: the codecs are WebAssembly
 * running in a Worker and the files never leave the tab.
 *
 * The controls are native elements rather than a component library because the
 * whole flow has to be usable from the keyboard — a file input, checkboxes,
 * sliders, a `<details>` for the codec knobs — and native controls come with
 * that behaviour and the right roles already.
 */
type TargetState = {
  enabled: boolean;
  quality: number;
  lossless: boolean;
  advanced: Record<string, number | boolean>;
};

type Rejected = { name: string; message: string };

const acceptedMimes = "image/png,image/jpeg,image/webp,image/avif,image/bmp";

/**
 * Every format starts disabled except WebP, which is what most conversions want.
 *
 * Spelled out rather than built from `imageFormats` so that adding a format to
 * the table without deciding how it starts here is a type error, not a silent
 * default.
 */
function initialTargets(): Record<ImageFormat, TargetState> {
  const off = { enabled: false, lossless: false, advanced: {} };

  return {
    png: { ...off, quality: formatSpecs.png.quality },
    jpeg: { ...off, quality: formatSpecs.jpeg.quality },
    webp: { ...off, enabled: true, quality: formatSpecs.webp.quality },
    avif: { ...off, quality: formatSpecs.avif.quality },
    bmp: { ...off, quality: formatSpecs.bmp.quality },
  };
}

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  const [targets, setTargets] = useState(initialTargets);
  const [maxEdge, setMaxEdge] = useState("");
  const [rotate, setRotate] = useState<Rotation>(0);
  const [background, setBackground] = useState("#ffffff");
  const [running, setRunning] = useState(false);
  const [planned, setPlanned] = useState<PlannedConversion[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  const pool = useRef<ConversionPool | null>(null);
  const cancelled = useRef(false);

  const enabledTargets = useMemo<TargetSettings[]>(
    () =>
      imageFormats
        .filter((format) => targets[format].enabled)
        .map((format) => ({
          format,
          quality: targets[format].quality,
          lossless: targets[format].lossless,
          advanced: targets[format].advanced,
        })),
    [targets],
  );

  const flattening = useMemo(
    () => enabledTargets.some((target) => !formatSpecs[target.format].alpha),
    [enabledTargets],
  );

  useEffect(
    () => () => {
      cancelled.current = true;
      pool.current?.terminate();
    },
    [],
  );

  const addFiles = useCallback(async (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;

    const accepted: File[] = [];
    const refused: Rejected[] = [];

    for (const file of Array.from(incoming)) {
      const size = checkLimits({ bytes: file.size });
      if (!size.ok) {
        refused.push({ name: file.name, message: size.message });
        continue;
      }

      // Extensions lie, so the format comes from the bytes themselves. Read as
      // many as `sniffFormat` may look at, or a brand late in an ISO-BMFF
      // header would be missed.
      const head = new Uint8Array(await file.slice(0, sniffByteLength).arrayBuffer());
      const format = sniffFormat(head);

      if (format === null) {
        refused.push({ name: file.name, message: "This file's format could not be recognised." });
      } else if (format === "heic") {
        refused.push({ name: file.name, message: "HEIC files are not supported yet." });
      } else {
        accepted.push(file);
      }
    }

    setFiles((previous) => [...previous, ...accepted]);
    setRejected((previous) => [...previous, ...refused]);
  }, []);

  const updateTarget = useCallback((format: ImageFormat, patch: Partial<TargetState>) => {
    setTargets((previous) => ({ ...previous, [format]: { ...previous[format], ...patch } }));
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    pool.current?.terminate();
    pool.current = null;
    setPlanned([]);
    setOutcomes([]);
    setRunning(false);
  }, []);

  // Not memoised: it is passed to a plain button, and the dependency list drew
  // a false "extra dependencies" report while buying nothing.
  async function start(): Promise<void> {
    const plan = planConversions(
      files.map((file) => file.name),
      enabledTargets,
    );
    if (plan.length === 0) return;

    cancelled.current = false;
    setPlanned(plan);
    setOutcomes([]);
    setRunning(true);

    const instance = new ConversionPool();
    pool.current = instance;

    const parsed = Number.parseInt(maxEdge, 10);

    try {
      await instance.run(
        files,
        plan,
        {
          targets: enabledTargets,
          rotate,
          maxEdge: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
          background,
        },
        (outcome) => {
          if (cancelled.current) return;
          setOutcomes((previous) => [...previous, outcome]);
        },
      );
    } finally {
      // Whatever happened, the Workers go away and the form becomes usable
      // again — a Batch that fails must not leave the Convert button disabled.
      instance.terminate();
      pool.current = null;
      setRunning(false);
    }
  }

  const succeeded = outcomes.flatMap((outcome) =>
    outcome.ok ? [{ name: outcome.conversion.outputName, bytes: outcome.bytes }] : [],
  );
  const failures = outcomes.flatMap((outcome) => (outcome.ok ? [] : [outcome]));

  return (
    <div className="mt-10 space-y-8">
      <section>
        <h2 className="text-lg font-medium">1. Add images</h2>
        <div
          className="mt-3 rounded-lg border border-dashed p-6"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (running) return;
            void addFiles(event.dataTransfer.files);
          }}
        >
          <input
            accept={acceptedMimes}
            className="peer sr-only"
            disabled={running}
            id="image-files"
            multiple
            onChange={(event) => {
              void addFiles(event.target.files);
              event.target.value = "";
            }}
            type="file"
          />
          <label
            className="flex cursor-pointer flex-col items-center rounded-md px-3 py-2 text-center peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
            htmlFor="image-files"
          >
            <span className="font-medium">Choose files</span>
            <span className="mt-1 text-sm text-muted-foreground">or drop them here</span>
          </label>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            PNG, JPEG, WebP, AVIF or BMP. Nothing is uploaded — the files stay in this tab.
          </p>
        </div>

        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((file, index) => (
              <li
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                key={`${file.name}-${index}`}
              >
                <span className="truncate">{file.name}</span>
                <button
                  className="ml-3 shrink-0 rounded px-2 py-1 text-muted-foreground hover:bg-muted"
                  disabled={running}
                  onClick={() => setFiles((previous) => previous.filter((_, at) => at !== index))}
                  type="button"
                >
                  Remove
                  <span className="sr-only"> {file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {rejected.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm">
            {rejected.map((entry) => (
              <li className="text-destructive" key={entry.name}>
                <span className="font-medium">{entry.name}</span>: {entry.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium">2. Convert to</h2>
        <fieldset className="mt-3 space-y-4">
          <legend className="sr-only">Target formats</legend>
          {imageFormats.map((format) => {
            const spec = formatSpecs[format];
            const state = targets[format];

            return (
              <div className="rounded-lg border p-4" key={format}>
                <div className="flex items-center gap-3">
                  <input
                    checked={state.enabled}
                    disabled={running}
                    id={`target-${format}`}
                    onChange={(event) => updateTarget(format, { enabled: event.target.checked })}
                    type="checkbox"
                  />
                  <label className="font-medium" htmlFor={`target-${format}`}>
                    {spec.label}
                  </label>
                  <span className="text-sm text-muted-foreground">.{spec.extension}</span>
                </div>

                {state.enabled && (
                  <div className="mt-4 space-y-4 border-l pl-4">
                    {spec.lossless === "optional" && (
                      <div className="flex items-center gap-3">
                        <input
                          checked={state.lossless}
                          disabled={running}
                          id={`lossless-${format}`}
                          onChange={(event) =>
                            updateTarget(format, { lossless: event.target.checked })
                          }
                          type="checkbox"
                        />
                        <label htmlFor={`lossless-${format}`}>Lossless</label>
                      </div>
                    )}

                    {spec.lossless !== "always" && (
                      <div>
                        <label className="text-sm" htmlFor={`quality-${format}`}>
                          Quality
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            className="w-full disabled:opacity-50"
                            disabled={running || state.lossless}
                            id={`quality-${format}`}
                            max={100}
                            min={1}
                            onChange={(event) =>
                              updateTarget(format, { quality: Number(event.target.value) })
                            }
                            type="range"
                            value={state.quality}
                          />
                          <output className="w-10 text-right text-sm tabular-nums">
                            {state.quality}
                          </output>
                        </div>
                      </div>
                    )}

                    <AdvancedPanel
                      fields={advancedFields[format] ?? []}
                      format={format}
                      onChange={(key, value) =>
                        updateTarget(format, { advanced: { ...state.advanced, [key]: value } })
                      }
                      running={running}
                      values={state.advanced}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>
      </section>

      <section>
        <h2 className="text-lg font-medium">3. Output</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm" htmlFor="max-edge">
              Longest edge (px)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              disabled={running}
              id="max-edge"
              min={16}
              onChange={(event) => setMaxEdge(event.target.value)}
              placeholder="Keep original"
              type="number"
              value={maxEdge}
            />
          </div>

          <div>
            <label className="text-sm" htmlFor="rotate">
              Rotate
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              disabled={running}
              id="rotate"
              onChange={(event) => setRotate(parseRotation(event.target.value))}
              value={rotate}
            >
              {[0, 90, 180, 270].map((degrees) => (
                <option key={degrees} value={degrees}>
                  {degrees}°
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm" htmlFor="background">
              Background
            </label>
            <input
              className="mt-1 h-10 w-full rounded-md border px-1 disabled:opacity-50"
              disabled={running || !flattening}
              id="background"
              onChange={(event) => setBackground(event.target.value)}
              type="color"
              value={background}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Fills transparent pixels for formats without alpha.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
          disabled={running || files.length === 0 || enabledTargets.length === 0}
          onClick={() => void start()}
          type="button"
        >
          Convert {files.length > 0 && `${files.length} file${files.length === 1 ? "" : "s"}`}
        </button>
        {running && (
          <button
            className="rounded-md border px-4 py-2 font-medium"
            onClick={cancel}
            type="button"
          >
            Cancel
          </button>
        )}
      </section>

      <section aria-live="polite" className="space-y-4">
        {planned.length > 0 && (
          <div>
            <p className="text-sm">
              {outcomes.length} of {planned.length} conversions done
            </p>
            <progress className="mt-2 w-full" max={planned.length} value={outcomes.length} />
          </div>
        )}

        {failures.length > 0 && (
          <ul className="space-y-1 text-sm">
            {failures.map((failure) => (
              <li className="text-destructive" key={failure.conversion.id}>
                <span className="font-medium">{failure.conversion.outputName}</span>:{" "}
                {failure.message}
              </li>
            ))}
          </ul>
        )}

        {succeeded.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium">4. Download</h2>
              <button
                className="rounded-md border px-4 py-2 text-sm font-medium"
                onClick={() => saveBlob(zipConversions(succeeded), "converted-images.zip")}
                type="button"
              >
                Download all as ZIP
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {outcomes.flatMap((outcome) =>
                outcome.ok ? (
                  <li
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    key={outcome.conversion.id}
                  >
                    <span className="truncate">
                      {outcome.conversion.outputName}
                      <span className="ml-2 text-muted-foreground">
                        {outcome.width}×{outcome.height}
                      </span>
                    </span>
                    <DownloadLink outcome={outcome} />
                  </li>
                ) : (
                  []
                ),
              )}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function AdvancedPanel({
  fields,
  format,
  onChange,
  running,
  values,
}: {
  fields: AdvancedField[];
  format: ImageFormat;
  onChange: (key: string, value: number | boolean) => void;
  running: boolean;
  values: Record<string, number | boolean>;
}) {
  if (fields.length === 0) return null;

  return (
    <details className="text-sm">
      <summary className="cursor-pointer">Advanced</summary>
      <div className="mt-3 space-y-3">
        {fields.map((field) => {
          const id = `advanced-${format}-${field.key}`;
          const value = values[field.key] ?? field.initial;

          return (
            <div className="flex items-center gap-3" key={field.key}>
              {field.kind === "boolean" ? (
                <>
                  <input
                    checked={value === true}
                    disabled={running}
                    id={id}
                    onChange={(event) => onChange(field.key, event.target.checked)}
                    type="checkbox"
                  />
                  <label htmlFor={id}>{field.label}</label>
                </>
              ) : (
                <>
                  <label className="w-56 shrink-0" htmlFor={id}>
                    {field.label}
                  </label>
                  <input
                    className="w-24 rounded-md border px-2 py-1"
                    disabled={running}
                    id={id}
                    max={field.max}
                    min={field.min}
                    onChange={(event) => onChange(field.key, Number(event.target.value))}
                    step={field.step}
                    type="number"
                    value={Number(value)}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </details>
  );
}

function DownloadLink({ outcome }: { outcome: Extract<Outcome, { ok: true }> }) {
  const url = useMemo(
    () => URL.createObjectURL(new Blob([outcome.bytes], { type: outcome.mime })),
    [outcome.bytes, outcome.mime],
  );

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <a
      className="shrink-0 rounded px-2 py-1 underline"
      download={outcome.conversion.outputName}
      href={url}
    >
      Download
    </a>
  );
}

function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** The rotation degrees are a union, so the select's string is mapped, not cast. */
function parseRotation(value: string): Rotation {
  switch (value) {
    case "90":
      return 90;
    case "180":
      return 180;
    case "270":
      return 270;
    default:
      return 0;
  }
}
