import { useState, useEffect } from "react";
import { getStore, ApiStore } from "../api/tokovio";

interface UseStoreResult {
  store: ApiStore | null;
  loading: boolean;
  error: string | null;
}

export function useStore(): UseStoreResult {
  const [store, setStore] = useState<ApiStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getStore()
      .then((data) => {
        if (!cancelled) setStore(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError((err as Error).message ?? "Failed to load store");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { store, loading, error };
}
