import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import type { MediaListItem } from "@/src/domain";
import { mediaRepo } from "@/src/lib/db";

export interface UseMediaResult {
  data: MediaListItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** Refreshes gallery rows from SQLite when Media tab regains focus. */
export function useMedia(): UseMediaResult {
  const [data, setData] = useState<MediaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await mediaRepo.listAll());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error("Failed to load media."));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { data, loading, error, refresh };
}
