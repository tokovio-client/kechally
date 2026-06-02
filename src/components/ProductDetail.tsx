import { useState } from "react";
import { Product } from "../data";
import { ApiVariant } from "../api/tokovio";
import { ChevronDown, ChevronUp, ArrowLeft, ShieldCheck, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductDetailProps {
  product: Product;
  variants: ApiVariant[];
  onBack: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    color: { name: string; hex: string },
    variant?: ApiVariant,
  ) => void;
  currency: "IDR" | "USD";
}

export default function ProductDetail({
  product,
  variants,
  onBack,
  onAddToCart,
  currency,
}: ProductDetailProps) {
  const hasVariants = variants.length > 0;
  const hasMultipleImages = product.images.length > 1;

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedVariant, setSelectedVariant] = useState<ApiVariant | null>(
    hasVariants ? variants[0] : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<"craft" | "sizing" | "shipping" | null>("craft");
  const [addedNotify, setAddedNotify] = useState(false);

  // Determine effective stock / price based on variant selection
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const effectivePriceIDR = selectedVariant ? selectedVariant.price : product.priceIDR;
  const effectivePriceUSD = Math.round(effectivePriceIDR / 15700);

  const isOutOfStock = effectiveStock === 0 || !product.is_active;
  const isLowStock = effectiveStock > 0 && effectiveStock <= 5;

  const formatPrice = (priceIDR: number, priceUSD: number) => {
    if (currency === "IDR") {
      return `IDR ${priceIDR.toLocaleString("id-ID")}`;
    } else {
      return `$${priceUSD.toFixed(2)}`;
    }
  };

  const handleToggleAccordion = (tab: "craft" | "sizing" | "shipping") => {
    setActiveAccordion((prev) => (prev === tab ? null : tab));
  };

  const handleAddToCartClick = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity, selectedColor, selectedVariant ?? undefined);
    setAddedNotify(true);
    setTimeout(() => setAddedNotify(false), 2500);
  };

  const handleQuantityIncrease = () => {
    setQuantity((q) => (effectiveStock > 0 ? Math.min(q + 1, effectiveStock) : q + 1));
  };

  const handlePrevImage = () => {
    setSelectedImageIdx((i) => (i === 0 ? product.images.length - 1 : i - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIdx((i) => (i === product.images.length - 1 ? 0 : i + 1));
  };

  const currentImage = product.images[selectedImageIdx] ?? product.image;

  return (
    <div className="w-full bg-brand-bg py-12 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-brand-primary hover:text-brand-accent transition text-[10px] uppercase tracking-widest font-bold mb-10 group cursor-pointer border-b border-brand-accent/10 pb-1"
        >
          <ArrowLeft size={12} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Collection</span>
        </button>

        {/* Main Product Panel Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── Left: Image Gallery ─────────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-4">

            {/* Primary image with nav arrows when multiple images exist */}
            <div className="aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-[4px] bg-brand-surface border border-brand-accent/10 relative group">
              <img
                key={currentImage}
                src={currentImage}
                alt={`${product.name} — view ${selectedImageIdx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                referrerPolicy="no-referrer"
              />

              {/* Tag badge */}
              <span className="absolute top-4 left-4 bg-brand-primary text-[#FDF8F5] text-[9px] font-mono tracking-[0.2em] uppercase px-3 py-1.5 rounded-[4px] font-bold">
                {product.tag}
              </span>

              {/* Image counter badge */}
              {hasMultipleImages && (
                <span className="absolute top-4 right-4 bg-black/40 text-white text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-[4px] backdrop-blur-sm">
                  {selectedImageIdx + 1} / {product.images.length}
                </span>
              )}

              {/* Prev / Next arrows — visible on hover when multiple images */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-brand-accent/10 text-brand-primary opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white cursor-pointer shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-brand-accent/10 text-brand-primary opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white cursor-pointer shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip — shown only when > 1 image */}
            {hasMultipleImages && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {product.images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`shrink-0 w-16 h-20 rounded-[4px] overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      selectedImageIdx === idx
                        ? "border-brand-primary scale-[1.03] shadow-sm"
                        : "border-brand-accent/15 hover:border-brand-accent/40 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="text-brand-muted font-serif text-[10px] italic text-center max-w-sm mx-auto">
              *Each item is hand-stitched — subtle floral deviations represent unique Javanese artistry.
            </p>
          </div>

          {/* ── Right: Info & Purchase Panel ───────────────────────────── */}
          <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-[10px] text-brand-accent uppercase tracking-[0.25em] font-sans font-bold">
                  {product.tag}
                </p>
                {isOutOfStock && (
                  <span className="text-[9px] font-mono font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                    Sold out
                  </span>
                )}
                {isLowStock && (
                  <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    Only {effectiveStock} left
                  </span>
                )}
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl text-brand-primary mt-2 font-bold italic tracking-tighter leading-none">
                {product.name}
              </h1>
              <p className="font-serif text-xl italic text-brand-primary font-bold tracking-tight mt-4 bg-brand-surface inline-block px-3 py-1.5 border border-brand-accent/10 rounded-[4px]">
                {formatPrice(effectivePriceIDR, effectivePriceUSD)}
              </p>
            </div>

            <p className="text-brand-muted text-xs sm:text-sm leading-relaxed font-serif text-justify italic">
              {product.description}
            </p>

            {/* ── Variant Selector (when variants exist) ─────────────── */}
            {hasVariants ? (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#5A3A3A] uppercase">
                  Variant:{" "}
                  <span className="font-sans text-brand-muted font-bold normal-case ml-1">
                    {selectedVariant?.name ?? "—"}
                  </span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const outOfStock = v.stock === 0;
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          if (!outOfStock) {
                            setSelectedVariant(v);
                            setQuantity(1);
                          }
                        }}
                        disabled={outOfStock}
                        title={outOfStock ? `${v.name} — sold out` : v.name}
                        className={`relative px-4 py-2 rounded-[4px] text-[11px] font-mono font-bold tracking-wide border transition-all duration-200 cursor-pointer
                          ${outOfStock ? "opacity-40 cursor-not-allowed line-through border-brand-accent/15 text-brand-muted bg-transparent" : ""}
                          ${isSelected && !outOfStock
                            ? "bg-brand-primary text-[#FDF8F5] border-brand-primary shadow-sm"
                            : !outOfStock
                            ? "bg-brand-surface text-brand-primary border-brand-accent/25 hover:border-brand-primary/50 hover:bg-brand-bg"
                            : ""
                          }`}
                      >
                        {v.name}
                        {outOfStock && (
                          <span className="ml-1.5 text-[8px] font-sans normal-case not-italic tracking-normal">sold out</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Variant SKU (if available) */}
                {selectedVariant?.sku && (
                  <p className="text-[9px] font-mono text-brand-muted tracking-widest">
                    SKU: {selectedVariant.sku}
                  </p>
                )}
              </div>
            ) : (
              /* ── Color Swatches fallback (when no variants) ─────────── */
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#5A3A3A] uppercase">
                  Color: <span className="font-sans text-brand-muted font-bold normal-case ml-1">{selectedColor.name}</span>
                </span>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full cursor-pointer relative flex items-center justify-center transition-all ${
                        selectedColor.name === color.name
                          ? "ring-2 ring-brand-primary ring-offset-2 scale-105"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      <span
                        className={`block w-8 h-8 rounded-full border ${
                          selectedColor.name === color.name
                            ? "border-brand-primary/40"
                            : "border-brand-accent/20"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-6 pt-2">
              <div className="space-y-1.5">
                <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">
                  Quantity
                </span>
                <div className="flex items-center border border-brand-accent/15 rounded-[4px] bg-brand-bg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-brand-muted hover:bg-brand-surface hover:text-brand-primary font-bold transition cursor-pointer"
                  >
                    —
                  </button>
                  <span className="px-4 py-2 font-mono text-xs text-brand-primary font-bold min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleQuantityIncrease}
                    disabled={isOutOfStock}
                    className="px-3.5 py-2 text-brand-muted hover:bg-brand-surface hover:text-brand-primary font-bold transition cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add To Bag CTA */}
            <div className="pt-2">
              <button
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
                className={`w-full text-xs sm:text-sm tracking-[0.25em] uppercase font-bold py-4 rounded-[4px] transition duration-300 shadow-none border ${
                  isOutOfStock
                    ? "bg-brand-accent/20 text-brand-accent/50 border-brand-accent/20 cursor-not-allowed"
                    : "bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent active:scale-[0.99] cursor-pointer border-brand-primary"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Bag"}
              </button>

              {isOutOfStock && (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-[4px] flex items-center space-x-2 font-serif italic">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>This item is currently unavailable. Check back soon.</span>
                </div>
              )}

              {addedNotify && (
                <div className="mt-3 bg-brand-surface border border-brand-accent/15 text-brand-primary text-xs px-4 py-3 rounded-[4px] flex items-center justify-between animate-fade-in font-serif italic">
                  <span>
                    Added{" "}
                    <strong>
                      {quantity}× {product.name}
                      {selectedVariant ? ` — ${selectedVariant.name}` : ` (${selectedColor.name})`}
                    </strong>{" "}
                    to your Shopping Bag!
                  </span>
                </div>
              )}
            </div>

            {/* Accordion Tabs */}
            <div className="border-t border-brand-accent/15 pt-4 space-y-2">

              {/* Craftsmanship */}
              <div className="border-b border-brand-accent/10 pb-3">
                <button
                  onClick={() => handleToggleAccordion("craft")}
                  className="w-full flex items-center justify-between text-left py-2 hover:text-brand-accent transition cursor-pointer"
                >
                  <span className="font-serif text-lg text-brand-primary font-bold italic tracking-tight">
                    Craftsmanship Details
                  </span>
                  {activeAccordion === "craft" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === "craft" && (
                  <div className="mt-2 text-xs text-brand-muted leading-relaxed font-serif pl-2 space-y-2.5 animate-slide-down italic">
                    {product.details.map((detail, idx) => (
                      <p key={idx} className="flex items-start">
                        <span className="text-brand-accent mr-2">•</span>
                        <span>{detail}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Sizing */}
              <div className="border-b border-brand-accent/10 pb-3">
                <button
                  onClick={() => handleToggleAccordion("sizing")}
                  className="w-full flex items-center justify-between text-left py-2 hover:text-brand-accent transition cursor-pointer"
                >
                  <span className="font-serif text-lg text-brand-primary font-bold italic tracking-tight">
                    Sizing & Proportion
                  </span>
                  {activeAccordion === "sizing" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === "sizing" && (
                  <div className="mt-2 text-xs text-brand-muted leading-relaxed font-serif pl-2 animate-slide-down italic">
                    <p>{product.sizing}</p>
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div className="border-b border-brand-accent/10 pb-3">
                <button
                  onClick={() => handleToggleAccordion("shipping")}
                  className="w-full flex items-center justify-between text-left py-2 hover:text-brand-accent transition cursor-pointer"
                >
                  <span className="font-serif text-lg text-brand-primary font-bold italic tracking-tight">
                    Conscious Shipping & Returns
                  </span>
                  {activeAccordion === "shipping" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === "shipping" && (
                  <div className="mt-2 text-xs text-brand-muted leading-relaxed font-serif pl-2 animate-slide-down italic">
                    <p>{product.shipping}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Safe indicators footer */}
            <div className="flex justify-around bg-brand-surface p-4 rounded-[4px] border border-brand-accent/10 text-[10px] text-brand-muted font-serif italic">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck size={14} className="text-brand-primary" />
                <span>Handmade with Clean Care</span>
              </div>
              <div className="w-[1px] bg-brand-accent/20" />
              <div className="flex items-center space-x-1.5">
                <ShieldCheck size={14} className="text-brand-primary" />
                <span>100% Cotton Rayon</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
