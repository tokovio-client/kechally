import { useState, useEffect } from "react";
import { getShippingMethods, ApiShippingMethod } from "../api/tokovio";

interface UseShippingMethodsResult {
  methods: ApiShippingMethod[];
  loading: boolean;
  error: string | null;
}

export function useShippingMethods(): UseShippingMethodsResult {
  const [methods, setMethods] = useState<ApiShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getShippingMethods()
      .then((data) => {
        if (!cancelled) setMethods(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError((err as Error).message ?? "Failed to load shipping methods");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { methods, loading, error };
}
