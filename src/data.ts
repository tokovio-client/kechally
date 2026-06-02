import { ApiProduct, ApiVariant } from "./api/tokovio";

// ─── Shared brand color palette (fallback for API products that have none) ───
export const BRAND_COLORS: { name: string; hex: string }[][] = [
  [
    { name: "Cream Off-white", hex: "#F5EFE6" },
    { name: "Soft Blush Pink", hex: "#E8C1C1" },
    { name: "Warm Sandy Brown", hex: "#D2C2B4" },
  ],
  [
    { name: "Pure White", hex: "#FFFFFF" },
    { name: "Stardust Silver", hex: "#E3E7E8" },
    { name: "Moonlight Blue", hex: "#D6E4E5" },
  ],
  [
    { name: "Warm Ivory", hex: "#FAF5EF" },
    { name: "Harvest Gold Accent", hex: "#EAD6B3" },
    { name: "Soft Olive Sage", hex: "#D5D8C8" },
  ],
  [
    { name: "Plum Indigo", hex: "#5C4B51" },
    { name: "Ocean Breeze Indigo", hex: "#4C5F7A" },
    { name: "Charcoal Mist", hex: "#4B4443" },
  ],
  [
    { name: "Desert Sand", hex: "#DECBB7" },
    { name: "Earth Brown", hex: "#8A6D5A" },
    { name: "Vintage Cashmere", hex: "#BCAEA2" },
  ],
  [
    { name: "Sage Green", hex: "#9CAF88" },
    { name: "Rose Quartz", hex: "#E2BCA4" },
    { name: "Warm Camel", hex: "#CBA386" },
  ],
];

// Fixed IDR → USD exchange rate for display purposes
export const IDR_TO_USD_RATE = 15700;

// ─── Product interface used throughout the UI ────────────────────────────────
export interface Product {
  id: string;
  num: string;
  name: string;
  tag: string;
  priceUSD: number;
  priceIDR: number;
  description: string;
  image: string;
  images: string[];   // all gallery images (first == primary)
  details: string[];
  sizing: string;
  shipping: string;
  colors: { name: string; hex: string }[];
  stock: number;
  is_active: boolean;
  variants: ApiVariant[];  // empty array when none
}

// ─── Adapter: ApiProduct → Product ──────────────────────────────────────────
let _productCounter = 0;

export function adaptApiProduct(api: ApiProduct, index?: number): Product {
  const idx = index ?? _productCounter++;
  const colorSet = BRAND_COLORS[idx % BRAND_COLORS.length];

  // Build ordered image list from the API images array, fall back to image_url
  const sortedImages = (api.images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((img) => img.url)
    .filter(Boolean);
  const images = sortedImages.length > 0 ? sortedImages : [api.image_url].filter(Boolean);

  return {
    id: api.id,
    num: String(idx + 1).padStart(2, "0"),
    name: api.name,
    tag: "Handcrafted",
    priceIDR: api.price,
    priceUSD: Math.round(api.price / IDR_TO_USD_RATE),
    description: api.description,
    image: images[0] ?? api.image_url,
    images,
    details: [
      "Hand-crafted using traditional techniques by skilled artisans in Malang, East Java.",
      "Made from premium materials for breathability, crisp feel, and all-day comfort.",
    ],
    sizing:
      "Available in standard adult size. Top Length: 125cm (front), 135cm (back). Skirt Length: 115cm, Skirt Width: 75cm. Suitable for heights up to 175cm.",
    shipping:
      "Free shipping across Indonesia. International shipping available via DHL (3-5 business days). Ships in a beautiful hand-crafted Kechally box.",
    colors: colorSet,
    stock: api.stock,
    is_active: api.is_active,
    variants: api.variants ?? [],
  };
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: { name: string; hex: string };
  selectedVariant?: ApiVariant;
  currency: "IDR" | "USD";
}

// ─── Brand content (not from API) ────────────────────────────────────────────
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote: "The quality is good and I feel like sharing it with everyone.",
    author: "Sofia",
    location: "Netherlands",
  },
  {
    id: "t2",
    quote:
      "MashaAllah, the Mukena Syadza is gorgeous. The hand stitching is flawless and the rayon material is so cool, which is amazing for Singapore's humid weather.",
    author: "Fatimah Zahra",
    location: "Singapore",
  },
  {
    id: "t3",
    quote:
      "I bought this as a gift for my mother, and tears came to her eyes when she saw the Malang embroidery craft. Kechally respects local traditions and empowers artisan mothers.",
    author: "Aisha",
    location: "Saudi Arabia",
  },
];

export const ARTISANS = [
  {
    title: "Crafted by the Locals",
    description:
      "Kechally is on a mission to empower over 30 artisan mothers in East Java, Malang. We collaborate closely to preserve their precious traditional hand-embroidery heritage, providing sustainable livelihoods and keeping these sacred techniques alive across generations.",
    image:
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "The Art of the Mukena",
    description:
      "Every single Kechally Mukena is hand-drawn, pinned, and carefully stitched. This meticulous cycle takes between 5 to 14 days of dedicated artisan hours. By blending cooling organic cotton-rayon and bamboo fibers with time-honored sulam techniques, we create a prayer companion that breathes, adapts, and endures.",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
  },
];
