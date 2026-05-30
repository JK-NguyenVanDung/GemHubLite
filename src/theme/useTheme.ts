import { useContext } from "react";

import { ThemeContext } from "@/src/theme/ThemeProvider";

/** useTheme reads the active visual theme for presentation-only components. */
export function useTheme() {
  return useContext(ThemeContext);
}
