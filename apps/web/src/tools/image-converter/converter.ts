import type { Rotation } from "./geometry";
import type { TargetSettings } from "./options";
import type { PlannedConversion } from "./plan";
import type { ConvertRequest, ConvertResponse } from "./worker";

/**
 * A Batch: every file the user added, the targets they enabled, and the output
 * settings that apply to all of them.
 */
export type BatchSettings = {
  targets: TargetSettings[];
  rotate: Rotation;
  maxEdge: number | null;
  background: string;
};

export type Outcome =
  | {
      ok: true;
      conversion: PlannedConversion;
      bytes: Uint8Array<ArrayBuffer>;
      mime: string;
      width: number;
      height: number;
    }
  | { ok: false; conversion: PlannedConversion; message: string };

/**
 * How many Conversions may run at once.
 *
 * One core is left for the page itself; the cap keeps four Workers' worth of
 * WebAssembly from competing for memory on a machine that does not have it.
 */
export function defaultPoolSize(): number {
  const cores = typeof navigator === "undefined" ? 1 : (navigator.hardwareConcurrency ?? 1);

  return Math.max(1, Math.min(4, cores - 1));
}

/**
 * A pool of Workers that each hold all the codecs, creating them lazily.
 *
 * Workers are created on the first Batch and reused for its lifetime so a
 * several-megabyte codec is instantiated once per Worker, not once per file.
 */
export class ConversionPool {
  readonly #size: number;
  #workers: Worker[] = [];
  #pending = new Set<() => void>();

  constructor(size: number = defaultPoolSize()) {
    this.#size = size;
  }

  async run(
    files: readonly File[],
    planned: readonly PlannedConversion[],
    settings: BatchSettings,
    onOutcome: (outcome: Outcome) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    if (planned.length === 0) return;

    this.#workers = Array.from({ length: Math.min(this.#size, planned.length) }, () =>
      this.#createWorker(),
    );

    let claimed = 0;
    const claim = () =>
      signal?.aborted || claimed >= planned.length ? undefined : planned[claimed++];

    await Promise.all(
      this.#workers.map((worker) => this.#pump(worker, files, settings, claim, onOutcome)),
    );
  }

  /** Stops every Worker, including one in the middle of a WebAssembly encode. */
  terminate(): void {
    for (const worker of this.#workers) worker.terminate();
    this.#workers = [];
    // Deleting the current entry during iteration is defined behaviour for a Set.
    for (const abort of this.#pending) abort();
    this.#pending.clear();
  }

  #createWorker(): Worker {
    return new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  }

  async #pump(
    worker: Worker,
    files: readonly File[],
    settings: BatchSettings,
    claim: () => PlannedConversion | undefined,
    onOutcome: (outcome: Outcome) => void,
  ): Promise<void> {
    for (;;) {
      const conversion = claim();
      if (!conversion) return;

      const file = files[conversion.sourceIndex];
      if (!file) {
        onOutcome({ ok: false, conversion, message: "The file is no longer in the list." });
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const response = await this.#send(worker, {
          id: conversion.id,
          bytes,
          target: conversion.target,
          rotate: settings.rotate,
          maxEdge: settings.maxEdge,
          background: settings.background,
        });

        onOutcome(
          response.ok
            ? {
                ok: true,
                conversion,
                bytes: new Uint8Array(response.bytes),
                mime: response.mime,
                width: response.width,
                height: response.height,
              }
            : { ok: false, conversion, message: response.message },
        );
      } catch (error) {
        onOutcome({ ok: false, conversion, message: describe(error) });
      }
    }
  }

  /** The Worker takes one Conversion at a time, so an id is enough to match up. */
  #send(worker: Worker, request: ConvertRequest): Promise<ConvertResponse> {
    return new Promise((resolve, reject) => {
      const settle = (result: () => void) => {
        this.#pending.delete(abort);
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        result();
      };
      const abort = () => settle(() => reject(new Error("Cancelled.")));
      const onError = () => settle(() => reject(new Error("The conversion Worker stopped.")));
      const onMessage = (event: MessageEvent<ConvertResponse>) => {
        if (event.data.id !== request.id) return;
        settle(() => resolve(event.data));
      };

      this.#pending.add(abort);
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError);
      worker.postMessage(request, [request.bytes]);
    });
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
