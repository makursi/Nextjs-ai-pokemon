import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("rounded", "border")).toBe("rounded border");
  });

  it("drops falsy values", () => {
    expect(cn("rounded", false, undefined, null, "")).toBe("rounded");
  });

  it("honours conditional objects", () => {
    expect(cn("rounded", { border: true, shadow: false })).toBe("rounded border");
  });

  it("lets the last conflicting Tailwind utility win", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});
