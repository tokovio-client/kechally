/**
 * Tokovio API Client
 * Typed fetch wrapper for all Kechally store endpoints.
 */

const BASE_URL = import.meta.env.VITE_TOKOVIO_BASE_URL ?? "https://api.tokovio.com";
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
  payment_config?: string;
  shipping_config?: string;
  created_at: string;
}

export interface ThemeConfig {
  // ── Hero ──────────────────────────────────────────────────────────────────
  hero?: {
    title?: string;
    eyebrow?: string;
    description?: string;
    primaryCta?: string;
    secondaryCta?: string;
    stats?: Array<{ value: string; label: string }>;
    floatingCardTag?: string;
    floatingCardTitle?: string;
    floatingCardSubtitle?: string;
    image?: string;
  };
  // ── Marquee ───────────────────────────────────────────────────────────────
  marquee?: {
    items?: string[];
  };
  // ── About ─────────────────────────────────────────────────────────────────
  about?: {
    eyebrow?: string;
    headline?: string;
    body1?: string;
    body2?: string;
    timeline?: Array<{ year: string; description: string }>;
    image?: string;
  };
  // ── Social Impact ─────────────────────────────────────────────────────────
  socialImpact?: {
    eyebrow?: string;
    headline?: string;
    body?: string;
    stats?: Array<{ value: string; label: string }>;
  };
  // ── Selected Pieces ───────────────────────────────────────────────────────
  selectedPieces?: {
    eyebrow?: string;
    headline?: string;
    body1?: string;
    body2?: string;
  };
  // ── Testimonial ───────────────────────────────────────────────────────────
  testimonial?: {
    quote?: string;
    attribution?: string;
  };
  // ── Collaboration CTA ─────────────────────────────────────────────────────
  collaboration?: {
    eyebrow?: string;
    headline?: string;
    body?: string;
    primaryCta?: string;
    instagramHandle?: string;
  };
  // ── Values Section ────────────────────────────────────────────────────────
  values?: {
    eyebrow?: string;
    headline?: string;
    description?: string;
    brandStatement?: string;
    brandPhilosophyLabel?: string;
    card1?: {
      title?: string;
      description?: string;
      label?: string;
    };
    card2?: {
      title?: string;
      description?: string;
      label?: string;
    };
    chaptersSubtitle?: string;
    chaptersTitle?: string;
    chapter1?: {
      title?: string;
      description?: string;
      image?: string;
    };
    chapter2?: {
      title?: string;
      description?: string;
      image?: string;
    };
    globalReachEyebrow?: string;
    globalReachHeadline?: string;
    globalReachCountries?: Array<{
      country: string;
      percentage: string;
      label: string;
      emoji: string;
    }>;
  };
  // ── Design tokens ─────────────────────────────────────────────────────────
  colors?: {
    primary?: string;
    surface?: string;
    tertiary?: string;
    secondary?: string;
    background?: string;
    "on-surface"?: string;
    "outline-variant"?: string;
    "surface-container"?: string;
    "on-surface-variant"?: string;
  };
  template?: string;
  customCSS?: string;
  heroStyle?: string;
  fontFamily?: string;
  borderRadius?: string;
  primaryColor?: string;
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

export interface ApiProvince {
  id: string;
  name: string;
}

export interface ApiCity {
  id: string;
  province_id: string;
  name: string;
  type: string;
}

export interface ApiDistrict {
  id: string;
  city_id: string;
  name: string;
}

export interface ApiSubdistrict {
  id: string;
  district_id: string;
  name: string;
  postal_code: string;
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
  province?: string;
  district?: string;
  subdistrict?: string;
}

export interface ApiCreateOrderPayload {
  items: ApiOrderItem[];
  customerInfo: ApiCustomerInfo;
  shippingAddress: ApiShippingAddress;
  payment_method: string;
  is_preorder: boolean;
  shipping_method?: string;
  shipping_price?: number;
  shipping_cost?: number;
}

export interface ApiOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_url?: string;
  is_preorder?: boolean;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_address?: string;
  shipping_cost?: number;
  courier?: string;
  tracking_number?: string;
  tracking_link?: string;
  payment_evidence_url?: string;
  delivery_photo_url?: string;
  items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
  }[];
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

async function rootFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
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

/** Fetch available shipping methods, optionally filtered by cityId */
export async function getShippingMethods(cityId?: string): Promise<ApiShippingMethod[]> {
  const query = cityId ? `?city_id=${encodeURIComponent(cityId)}` : "";
  const res = await apiFetch<ApiShippingResponse>(`/shipping-methods${query}`);
  return res.data ?? [];
}

/** Submit a new order */
export async function createOrder(payload: ApiCreateOrderPayload): Promise<ApiOrder> {
  return apiFetch<ApiOrder>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Fetch a specific order by ID */
export async function getOrder(orderId: string): Promise<ApiOrder> {
  return rootFetch<ApiOrder>(`/orders/${orderId}`);
}

/** Fetch all provinces */
export async function getProvinces(): Promise<ApiProvince[]> {
  return rootFetch<ApiProvince[]>("/provinces");
}

/** Fetch cities in a province */
export async function getCities(provinceId: string): Promise<ApiCity[]> {
  return rootFetch<ApiCity[]>(`/cities?province_id=${provinceId}`);
}

/** Fetch districts in a city */
export async function getDistricts(cityId: string): Promise<ApiDistrict[]> {
  return rootFetch<ApiDistrict[]>(`/districts?city_id=${cityId}`);
}

/** Fetch subdistricts in a district */
export async function getSubdistricts(districtId: string): Promise<ApiSubdistrict[]> {
  return rootFetch<ApiSubdistrict[]>(`/subdistricts?district_id=${districtId}`);
}

/** Request OTP for security verification */
export async function requestOtp(target: string, method: "email" | "sms" = "email"): Promise<{ message: string }> {
  return rootFetch<{ message: string }>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ target, method }),
  });
}

/** Verify Buyer OTP code */
export async function verifyBuyerOtp(target: string, code: string): Promise<{ success: boolean; message?: string }> {
  return rootFetch<{ success: boolean; message?: string }>("/auth/verify-buyer-otp", {
    method: "POST",
    body: JSON.stringify({ target, code }),
  });
}

/** Upload payment proof for a manual transfer order */
export async function uploadPaymentEvidence(orderId: string, file: File): Promise<{ success: boolean }> {
  const formData = new FormData();
  formData.append("evidence", file);

  const res = await fetch(`${BASE_URL}/orders/${orderId}/payment-evidence`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new TokovioApiError(res.status, text || `HTTP ${res.status}`);
  }

  return res.json();
}

/** Confirm delivery with an optional photo */
export async function confirmDelivery(orderId: string, photo?: File): Promise<{ success: boolean }> {
  const formData = new FormData();
  if (photo) {
    formData.append("photo", photo);
  }

  const res = await fetch(`${BASE_URL}/orders/${orderId}/deliver`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new TokovioApiError(res.status, text || `HTTP ${res.status}`);
  }

  return res.json();
}

