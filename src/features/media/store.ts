import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

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
  const refreshIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const refreshId = refreshIdRef.current + 1;
    refreshIdRef.current = refreshId;
    setLoading(true);
    setError(null);

    try {
      const media = await mediaRepo.listAll();
      if (refreshId === refreshIdRef.current) {
        setData(media);
      }
    } catch (caughtError) {
      if (refreshId === refreshIdRef.current) {
        setError(caughtError instanceof Error ? caughtError : new Error("Failed to load media."));
      }
    } finally {
      if (refreshId === refreshIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      return () => {
        refreshIdRef.current += 1;
        setLoading(false);
      };
    }, [refresh]),
  );

  return { data, loading, error, refresh };
}
