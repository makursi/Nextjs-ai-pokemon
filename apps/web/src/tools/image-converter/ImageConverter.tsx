"use client";

import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  CloseButton,
  Collapse,
  ColorInput,
  FileButton,
  Group,
  NumberInput,
  Paper,
  Progress,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
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
 * The controls are Mantine components, so labels, roles and keyboard behaviour
 * come from the library rather than being re-derived here — which is also why
 * the file input is a `Dropzone`: it is clickable, droppable and reachable from
 * the keyboard (Space/Enter) in one element.
 */
type TargetState = {
  enabled: boolean;
  quality: number;
  lossless: boolean;
  advanced: Record<string, number | boolean>;
};

type Rejected = { name: string; message: string };

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

  const addFiles = useCallback(async (incoming: readonly File[]) => {
    if (incoming.length === 0) return;

    const accepted: File[] = [];
    const refused: Rejected[] = [];

    for (const file of incoming) {
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
    <Stack gap="xl" mt="xl">
      <section>
        <Title order={2} size="h4">
          1. Add images
        </Title>

        {/*
          No `accept` prop on purpose: it filters by the file's declared type, and
          a renamed file is exactly what `sniffFormat` is here to catch.

          The drop zone is only the drag target. Clicking and the keyboard go
          through the FileButton inside it: that is a real `<button>`, so it is
          announced as one, whereas react-dropzone labels its own root
          `role="presentation"` — making that the control would mean overriding
          the role by hand, which is the thing jsx-a11y exists to stop.
        */}
        <Dropzone
          activateOnClick={false}
          activateOnKeyboard={false}
          disabled={running}
          enablePointerEvents
          mt="sm"
          multiple
          onDrop={(dropped) => {
            void addFiles(dropped);
          }}
          p="lg"
        >
          <Stack align="center" gap="sm">
            <FileButton
              disabled={running}
              multiple
              onChange={(picked) => void addFiles(toFiles(picked))}
            >
              {(props) => (
                <Button {...props} variant="default">
                  Choose files
                </Button>
              )}
            </FileButton>
            <Text c="dimmed" size="sm">
              or drop them here
            </Text>
          </Stack>
        </Dropzone>

        <Text c="dimmed" mt="xs" size="xs">
          PNG, JPEG, WebP, AVIF or BMP. Nothing is uploaded — the files stay in this tab.
        </Text>

        {files.length > 0 && (
          <Stack gap="xs" mt="md">
            {files.map((file, index) => (
              <Paper key={`${file.name}-${index}`} p="xs" withBorder>
                <Group justify="space-between" wrap="nowrap">
                  <Text size="sm" truncate>
                    {file.name}
                  </Text>
                  <CloseButton
                    aria-label={`Remove ${file.name}`}
                    disabled={running}
                    onClick={() => setFiles((previous) => previous.filter((_, at) => at !== index))}
                  />
                </Group>
              </Paper>
            ))}
          </Stack>
        )}

        {rejected.length > 0 && (
          <Alert color="red" mt="md" title="Some files were not added">
            <Stack gap={4}>
              {rejected.map((entry) => (
                <Text key={entry.name} size="sm">
                  <Text component="span" fw={500} inherit>
                    {entry.name}
                  </Text>
                  {`: ${entry.message}`}
                </Text>
              ))}
            </Stack>
          </Alert>
        )}
      </section>

      <section>
        <Title order={2} size="h4">
          2. Convert to
        </Title>

        <Stack gap="md" mt="sm">
          {imageFormats.map((format) => {
            const spec = formatSpecs[format];
            const state = targets[format];

            return (
              <Paper key={format} p="md" withBorder>
                <Checkbox
                  checked={state.enabled}
                  disabled={running}
                  label={`${spec.label} (.${spec.extension})`}
                  onChange={(event) =>
                    updateTarget(format, { enabled: event.currentTarget.checked })
                  }
                />

                <Collapse expanded={state.enabled} keepMounted={false}>
                  <Stack gap="sm" mt="md" pl="lg">
                    {spec.lossless === "optional" && (
                      <Switch
                        checked={state.lossless}
                        disabled={running}
                        label="Lossless"
                        onChange={(event) =>
                          updateTarget(format, { lossless: event.currentTarget.checked })
                        }
                      />
                    )}

                    {spec.lossless !== "always" && (
                      <div>
                        <Text fw={500} size="sm">
                          Quality: {state.quality}
                        </Text>
                        <Slider
                          disabled={running || state.lossless}
                          max={100}
                          min={1}
                          mt="xs"
                          onChange={(value) => updateTarget(format, { quality: value })}
                          thumbLabel={`${spec.label} quality`}
                          value={state.quality}
                        />
                      </div>
                    )}

                    <AdvancedPanel
                      fields={advancedFields[format] ?? []}
                      onChange={(key, value) =>
                        updateTarget(format, { advanced: { ...state.advanced, [key]: value } })
                      }
                      running={running}
                      values={state.advanced}
                    />
                  </Stack>
                </Collapse>
              </Paper>
            );
          })}
        </Stack>
      </section>

      <section>
        <Title order={2} size="h4">
          3. Output
        </Title>

        <SimpleGrid cols={{ base: 1, sm: 3 }} mt="sm">
          <NumberInput
            description="Leave empty to keep the source size."
            disabled={running}
            label="Longest edge (px)"
            min={16}
            onChange={(value) => setMaxEdge(typeof value === "number" ? String(value) : value)}
            placeholder="Keep original"
            value={maxEdge}
          />

          <Select
            allowDeselect={false}
            data={rotationOptions}
            disabled={running}
            label="Rotate"
            onChange={(value) => setRotate(parseRotation(value ?? "0"))}
            value={String(rotate)}
          />

          <ColorInput
            description="Fills transparent pixels for formats without alpha."
            disabled={running || !flattening}
            format="hex"
            label="Background"
            onChange={setBackground}
            value={background}
          />
        </SimpleGrid>
      </section>

      <Group>
        <Button
          disabled={running || files.length === 0 || enabledTargets.length === 0}
          onClick={() => void start()}
        >
          Convert {files.length > 0 && `${files.length} file${files.length === 1 ? "" : "s"}`}
        </Button>
        {running && (
          <Button onClick={cancel} variant="default">
            Cancel
          </Button>
        )}
      </Group>

      <section aria-live="polite">
        {planned.length > 0 && (
          <div>
            <Text size="sm">
              {outcomes.length} of {planned.length} conversions done
            </Text>
            <Progress mt="xs" value={(outcomes.length / planned.length) * 100} />
          </div>
        )}

        {failures.length > 0 && (
          <Alert color="red" mt="md" title="Some conversions failed">
            <Stack gap={4}>
              {failures.map((failure) => (
                <Text key={failure.conversion.id} size="sm">
                  <Text component="span" fw={500} inherit>
                    {failure.conversion.outputName}
                  </Text>
                  {`: ${failure.message}`}
                </Text>
              ))}
            </Stack>
          </Alert>
        )}

        {succeeded.length > 0 && (
          <Stack gap="sm" mt="xl">
            <Group justify="space-between">
              <Title order={2} size="h4">
                4. Download
              </Title>
              <Button
                onClick={() => saveBlob(zipConversions(succeeded), "converted-images.zip")}
                variant="default"
              >
                Download all as ZIP
              </Button>
            </Group>

            <Stack gap="xs">
              {outcomes.flatMap((outcome) =>
                outcome.ok ? (
                  <Paper key={outcome.conversion.id} p="xs" withBorder>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" truncate>
                        {outcome.conversion.outputName}
                        <Text c="dimmed" component="span" inherit>
                          {`  ${outcome.width}×${outcome.height}`}
                        </Text>
                      </Text>
                      <DownloadLink outcome={outcome} />
                    </Group>
                  </Paper>
                ) : (
                  []
                ),
              )}
            </Stack>
          </Stack>
        )}
      </section>
    </Stack>
  );
}

function AdvancedPanel({
  fields,
  onChange,
  running,
  values,
}: {
  fields: AdvancedField[];
  onChange: (key: string, value: number | boolean) => void;
  running: boolean;
  values: Record<string, number | boolean>;
}) {
  const [expanded, setExpanded] = useState(false);

  if (fields.length === 0) return null;

  return (
    <div>
      <Button
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
        size="compact-sm"
        variant="subtle"
      >
        Advanced
      </Button>

      <Collapse expanded={expanded} keepMounted={false}>
        <Stack gap="sm" mt="sm">
          {fields.map((field) => {
            const value = values[field.key] ?? field.initial;

            return field.kind === "boolean" ? (
              <Checkbox
                checked={value === true}
                disabled={running}
                key={field.key}
                label={field.label}
                onChange={(event) => onChange(field.key, event.currentTarget.checked)}
              />
            ) : (
              <NumberInput
                disabled={running}
                key={field.key}
                label={field.label}
                max={field.max}
                min={field.min}
                onChange={(next) =>
                  onChange(field.key, typeof next === "number" ? next : Number(next))
                }
                step={field.step}
                value={Number(value)}
              />
            );
          })}
        </Stack>
      </Collapse>
    </div>
  );
}

function DownloadLink({ outcome }: { outcome: Extract<Outcome, { ok: true }> }) {
  const url = useMemo(
    () => URL.createObjectURL(new Blob([outcome.bytes], { type: outcome.mime })),
    [outcome.bytes, outcome.mime],
  );

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <Anchor download={outcome.conversion.outputName} href={url} size="sm">
      Download
    </Anchor>
  );
}

const rotationOptions = ["0", "90", "180", "270"].map((degrees) => ({
  value: degrees,
  label: `${degrees}°`,
}));

/** FileButton hands back one file, an array of them, or nothing. */
function toFiles(picked: File[] | File | null): File[] {
  if (!picked) return [];

  return Array.isArray(picked) ? picked : [picked];
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
