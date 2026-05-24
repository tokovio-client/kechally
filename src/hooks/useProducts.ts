import { useState, useEffect, useCallback, useRef } from "react";
import { getProducts, ApiProduct } from "../api/tokovio";

interface UseProductsResult {
  products: ApiProduct[];
  loading: boolean;
  error: string | null;
  refetch: (query?: string) => void;
}

export function useProducts(initialQuery?: string): UseProductsResult {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async (query?: string) => {
    // Cancel previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const data = await getProducts(query);
      setProducts(data.filter((p) => p.is_active));
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(initialQuery);
    return () => abortRef.current?.abort();
  }, [fetch, initialQuery]);

  return { products, loading, error, refetch: fetch };
}
