import { createContext, type ReactNode } from "react";

import { theme as defaultTheme } from "@/src/theme/theme";
import type { AppTheme } from "@/src/theme/types";

export const ThemeContext = createContext<AppTheme>(defaultTheme);

/** ThemeProvider supplies one theme source so UI primitives avoid direct token imports. */
export function ThemeProvider({ value = defaultTheme, children }: { value?: AppTheme; children: ReactNode }) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
