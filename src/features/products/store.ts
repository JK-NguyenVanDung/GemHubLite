import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import type { ProductListItem } from "@/src/domain";
import { productsRepo } from "@/src/lib/db";

export interface UseProductsResult {
  data: ProductListItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** Refreshes product cards from SQLite when Products tab regains focus. */
export function useProducts(): UseProductsResult {
  const [data, setData] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refreshIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const refreshId = refreshIdRef.current + 1;
    refreshIdRef.current = refreshId;
    setLoading(true);
    setError(null);

    try {
      const products = await productsRepo.list();
      if (refreshId === refreshIdRef.current) {
        setData(products);
      }
    } catch (caughtError) {
      if (refreshId === refreshIdRef.current) {
        setError(caughtError instanceof Error ? caughtError : new Error("Failed to load products."));
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
