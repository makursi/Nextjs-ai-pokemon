"use client";

import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";

import { cssVariables, theme } from "./theme";

/**
 * The provider lives in a Client Component because it takes a function.
 *
 * `cssVariablesResolver` is one, and a Server Component may not hand a function
 * to a Client Component — the build rejects it. Importing the theme here instead
 * of passing it down from the layout keeps that boundary intact, and only
 * serialisable children cross it.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider cssVariablesResolver={cssVariables} defaultColorScheme="auto" theme={theme}>
      {children}
    </MantineProvider>
  );
}
