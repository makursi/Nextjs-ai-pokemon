import { describe, expect, it } from "vitest";

import { checkLimits, defaultLimits, type LimitResult } from "@/tools/image-converter/limits";

/** Narrowing helper: the tests below are all about which failure came back. */
function failure(result: LimitResult): Extract<LimitResult, { ok: false }> {
  if (result.ok) throw new Error("expected the limits to reject this input");

  return result;
}

describe("checkLimits", () => {
  it("accepts a file inside both limits", () => {
    expect(checkLimits({ bytes: 1024, width: 800, height: 600 })).toEqual({ ok: true });
  });

  it("accepts a file whose dimensions are not known yet", () => {
    expect(checkLimits({ bytes: 1024 })).toEqual({ ok: true });
  });

  it("rejects a file over the byte limit", () => {
    expect(failure(checkLimits({ bytes: defaultLimits.maxBytes + 1 })).reason).toBe("too-large");
  });

  it("rejects an image over the pixel limit", () => {
    expect(failure(checkLimits({ width: 20000, height: 20000 })).reason).toBe("too-many-pixels");
  });

  it("checks bytes before pixels so the cheaper failure wins", () => {
    const result = checkLimits({
      bytes: defaultLimits.maxBytes + 1,
      width: 20000,
      height: 20000,
    });

    expect(failure(result).reason).toBe("too-large");
  });

  it("explains the failure in the message", () => {
    expect(failure(checkLimits({ width: 20000, height: 20000 })).message).toContain("20000");
  });

  it("honours custom limits", () => {
    const result = checkLimits({ bytes: 2048 }, { maxBytes: 1024, maxPixels: 1024 });

    expect(result.ok).toBe(false);
  });
});
