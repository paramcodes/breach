"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

const ThemeProviderCompat = ThemeProvider as (props: {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}) => React.JSX.Element;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProviderCompat attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProviderCompat>
  );
}
