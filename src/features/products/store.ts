import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await productsRepo.list());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error("Failed to load products."));
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
