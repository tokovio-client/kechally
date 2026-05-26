import { useState, useEffect } from "react";
import { getStore, ApiStore, ThemeConfig } from "../api/tokovio";

interface UseStoreResult {
  store: ApiStore | null;
  parsedTheme: ThemeConfig | null;
  loading: boolean;
  error: string | null;
}

export function useStore(): UseStoreResult {
  const [store, setStore] = useState<ApiStore | null>(null);
  const [parsedTheme, setParsedTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getStore()
      .then((data) => {
        if (!cancelled) {
          setStore(data);
          try {
            if (data.theme_config) {
              setParsedTheme(JSON.parse(data.theme_config));
            }
          } catch (err) {
            console.error("Failed to parse store theme_config", err);
          }
        }
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

  return { store, parsedTheme, loading, error };
}
