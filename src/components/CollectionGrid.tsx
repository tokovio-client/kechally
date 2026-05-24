import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, Search, X, Loader2, AlertCircle } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { adaptApiProduct, Product } from "../data";

interface CollectionGridProps {
  onSelectProduct: (productId: string) => void;
  currency: "IDR" | "USD";
}

function ProductSkeleton() {
  return (
    <div className="bg-white p-8 sm:p-10 min-h-[310px] flex flex-col justify-between border-b border-r border-brand-accent/15 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-16 w-16 bg-brand-accent/10 rounded" />
      </div>
      <div className="space-y-3 mt-4 flex-grow">
        <div className="h-6 w-3/4 bg-brand-accent/10 rounded" />
        <div className="h-3 w-full bg-brand-accent/8 rounded" />
        <div className="h-3 w-5/6 bg-brand-accent/8 rounded" />
      </div>
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-brand-accent/10">
        <div className="h-5 w-24 bg-brand-accent/10 rounded-full" />
        <div className="h-4 w-16 bg-brand-accent/10 rounded" />
      </div>
    </div>
  );
}

export default function CollectionGrid({ onSelectProduct, currency }: CollectionGridProps) {
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | undefined>(undefined);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { products: apiProducts, loading, error, refetch } = useProducts(activeQuery);

  // Debounced search: wait 400ms after the user stops typing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const q = searchInput.trim();
      setActiveQuery(q || undefined);
      refetch(q || undefined);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput, refetch]);

  const products: Product[] = apiProducts.map((p, i) => adaptApiProduct(p, i));

  const formatPrice = (prod: Product) => {
    if (currency === "IDR") {
      return `IDR ${prod.priceIDR.toLocaleString("id-ID")}`;
    }
    return `$${prod.priceUSD.toFixed(2)}`;
  };

  const clearSearch = () => {
    setSearchInput("");
    setActiveQuery(undefined);
    refetch(undefined);
  };

  return (
    <div id="products-catalog-section" className="w-full bg-white py-20 md:py-28 transition-all duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 space-y-4">
          <p className="text-brand-accent font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
            OUR COLLECTION
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-primary font-normal tracking-tight">
            Each Piece, a <span className="font-serif italic font-bold text-brand-accent">Prayer</span>
          </h2>
          <div className="h-[1px] bg-brand-accent/20 w-16 mx-auto mt-4" />
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-14 relative">
          <div className="relative flex items-center">
            <Search
              size={14}
              className="absolute left-4 text-brand-accent/60 pointer-events-none"
            />
            <input
              id="product-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-3 bg-brand-bg border border-brand-accent/20 rounded-[4px] text-xs font-serif italic text-brand-primary placeholder:text-brand-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-accent transition"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-brand-muted hover:text-brand-primary transition cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {activeQuery && !loading && (
            <p className="text-center text-[10px] text-brand-muted font-sans mt-2 tracking-wide">
              {products.length} result{products.length !== 1 ? "s" : ""} for &ldquo;{activeQuery}&rdquo;
            </p>
          )}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-16 space-y-4">
            <AlertCircle size={32} className="mx-auto text-brand-accent/60" />
            <p className="text-brand-muted font-serif italic text-sm">
              Unable to load products. Please try again.
            </p>
            <button
              onClick={() => refetch(activeQuery)}
              className="text-xs font-sans font-bold uppercase tracking-widest text-brand-primary border border-brand-primary/30 px-6 py-2.5 rounded-[4px] hover:bg-brand-primary hover:text-[#FDF8F5] transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state — Skeleton Grid */}
        {loading && (
          <div className="border-t border-l border-brand-accent/15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty search state */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <p className="font-serif italic text-brand-muted text-sm">
              No products found{activeQuery ? ` for "${activeQuery}"` : ""}.
            </p>
            {activeQuery && (
              <button
                onClick={clearSearch}
                className="text-xs font-sans font-bold uppercase tracking-widest text-brand-accent underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="border-t border-l border-brand-accent/15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {products.map((prod, index) => (
              <div
                key={prod.id}
                id={`product-card-${prod.id}`}
                onClick={() => onSelectProduct(prod.id)}
                className="group relative bg-white p-8 sm:p-10 min-h-[310px] flex flex-col justify-between border-b border-r border-brand-accent/15 cursor-pointer overflow-hidden transition-all duration-500 hover:bg-[#FAF6F4]/40"
              >
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#C48A8F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />

                {/* Top row: faded number + arrow */}
                <div className="flex justify-between items-start">
                  <span className="font-serif text-6xl sm:text-7xl lg:text-8xl text-brand-pink/15 italic font-bold leading-none select-none tracking-tighter transition-all duration-500 group-hover:text-brand-pink/25">
                    {prod.num}
                  </span>
                  <div className="pt-2 flex items-center space-x-2">
                    {/* Stock badge */}
                    {prod.stock <= 5 && prod.stock > 0 && (
                      <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        Only {prod.stock} left
                      </span>
                    )}
                    {prod.stock === 0 && (
                      <span className="text-[9px] font-mono font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                        Sold out
                      </span>
                    )}
                    <ArrowUpRight
                      size={18}
                      className="text-brand-accent/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Name & Description */}
                <div className="space-y-2 mt-4 flex-grow">
                  <h3 className="font-serif text-2xl text-brand-primary font-medium tracking-tight group-hover:text-brand-accent transition-colors duration-300">
                    {prod.name}
                  </h3>
                  <p className="text-brand-muted text-xs leading-relaxed font-serif italic text-justify line-clamp-2 max-w-sm">
                    {prod.description}
                  </p>
                </div>

                {/* Bottom row: tag + price */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-brand-accent/10">
                  <span className="bg-[#FAF0F0] text-brand-accent border border-brand-accent/10 px-3.5 py-1 text-[9px] sm:text-[10px] tracking-widest uppercase font-bold rounded-full transition-colors duration-300 group-hover:bg-[#F3E1E1]">
                    {prod.tag}
                  </span>
                  <span className="font-serif text-xs sm:text-sm italic font-bold text-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                    {formatPrice(prod)}
                  </span>
                </div>

                {/* Grain overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none mix-blend-overlay z-10">
                  <filter id={`noise-${index}`}>
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                  </filter>
                  <rect width="100%" height="100%" filter={`url(#noise-${index})`} />
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator for search refetch */}
        {loading && activeQuery && (
          <div className="flex items-center justify-center py-4 space-x-2 text-brand-muted text-xs font-serif italic">
            <Loader2 size={14} className="animate-spin" />
            <span>Searching...</span>
          </div>
        )}

      </div>
    </div>
  );
}
