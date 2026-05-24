/**
 * Tokovio API Client
 * Typed fetch wrapper for all Kechally store endpoints.
 */

const BASE_URL = import.meta.env.VITE_TOKOVIO_BASE_URL ?? "https://api.tokovio.biz.id";
const STORE_SLUG = import.meta.env.VITE_TOKOVIO_STORE_SLUG ?? "kechally";
const API_KEY = import.meta.env.VITE_TOKOVIO_API_KEY ?? "";

const STORE_BASE = `${BASE_URL}/stores/${STORE_SLUG}`;

const headers = {
  "X-API-Key": API_KEY,
  "Content-Type": "application/json",
};

// ─── Response Types ─────────────────────────────────────────────────────────

export interface ApiStore {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string;
  is_published: boolean;
  theme_config: string;
  created_at: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number; // IDR
  stock: number;
  is_active: boolean;
  image_url: string;
  created_at: string;
}

export interface ApiShippingMethod {
  courier: string;
  service: string;
  price: number;
}

export interface ApiShippingResponse {
  data: ApiShippingMethod[];
}

export interface ApiOrderItem {
  productId: string;
  quantity: number;
}

export interface ApiCustomerInfo {
  name: string;
  phone: string;
  email: string;
}

export interface ApiShippingAddress {
  address: string;
  city: string;
  postal_code: string;
}

export interface ApiCreateOrderPayload {
  items: ApiOrderItem[];
  customerInfo: ApiCustomerInfo;
  shippingAddress: ApiShippingAddress;
  payment_method: string;
  is_preorder: boolean;
}

export interface ApiOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

// ─── Error Handling ──────────────────────────────────────────────────────────

export class TokovioApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "TokovioApiError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${STORE_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers ?? {}) },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new TokovioApiError(res.status, text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── API Methods ─────────────────────────────────────────────────────────────

/** Fetch store metadata (name, logo, description) */
export async function getStore(): Promise<ApiStore> {
  const res = await fetch(`${BASE_URL}/stores/${STORE_SLUG}`, {
    headers: { "X-API-Key": API_KEY },
  });
  if (!res.ok) throw new TokovioApiError(res.status, `Failed to load store`);
  return res.json();
}

/** Fetch all products, optionally filtered by search query */
export async function getProducts(query?: string): Promise<ApiProduct[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiFetch<ApiProduct[]>(`/products${params}`);
}

/** Fetch a single product by ID */
export async function getProduct(id: string): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/products/${id}`);
}

/** Fetch available shipping methods */
export async function getShippingMethods(): Promise<ApiShippingMethod[]> {
  const res = await apiFetch<ApiShippingResponse>("/shipping-methods");
  return res.data ?? [];
}

/** Submit a new order */
export async function createOrder(payload: ApiCreateOrderPayload): Promise<ApiOrder> {
  return apiFetch<ApiOrder>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
