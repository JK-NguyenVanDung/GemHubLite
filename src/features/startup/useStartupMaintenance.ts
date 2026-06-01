import { Paths } from "expo-file-system";
import { useEffect, useState } from "react";

import { cleanupOrphanedMedia } from "@/src/lib/files";

const LOW_STORAGE_WARNING_BYTES = 500 * 1024 * 1024;

export function useStartupMaintenance() {
  const [storageWarning] = useState<string | null>(() => {
    const available = Paths.availableDiskSpace;
    return typeof available === "number" && available > 0 && available < LOW_STORAGE_WARNING_BYTES
      ? "Device storage is low. Captures still work, but large imports may fail until space is freed."
      : null;
  });

  useEffect(() => {
    void cleanupOrphanedMedia().catch(() => {
      // Startup cleanup is defensive; failing cleanup must not block local catalog use.
    });
  }, []);

  return { storageWarning };
}
