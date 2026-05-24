import React, { useState } from "react";
import { Trash2, AlertCircle, ShieldCheck, ArrowRight, CheckCircle2, Loader2, Package, Truck } from "lucide-react";
import { CartItem } from "../data";
import { useShippingMethods } from "../hooks/useShippingMethods";
import { createOrder, ApiShippingMethod } from "../api/tokovio";

interface CartViewProps {
  cartItems: CartItem[];
  currency: "IDR" | "USD";
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  setActiveTab: (tab: "story" | "products" | "values" | "bag") => void;
}

export default function CartView({
  cartItems,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  setActiveTab,
}: CartViewProps) {
  const [checkoutStep, setCheckoutStep] = useState<"bag" | "form" | "shipping" | "confirm">("bag");

  // Form fields
  const [shippingName, setShippingName] = useState("");
  const [shippingEmail, setShippingEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostal, setShippingPostal] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [formError, setFormError] = useState("");

  // Shipping selection
  const { methods: shippingMethods, loading: shippingLoading, error: shippingError } = useShippingMethods();
  const [selectedShipping, setSelectedShipping] = useState<ApiShippingMethod | null>(null);

  // Order result
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────

  const calculateSubtotal = () =>
    cartItems.reduce((acc, item) => {
      const price = currency === "IDR" ? item.product.priceIDR : item.product.priceUSD;
      return acc + price * item.quantity;
    }, 0);

  const shippingCostDisplay = () => {
    if (!selectedShipping) return "Select shipping";
    if (currency === "IDR") return `IDR ${selectedShipping.price.toLocaleString("id-ID")}`;
    const usd = Math.round(selectedShipping.price / 15700);
    return `$${usd.toFixed(2)}`;
  };

  const shippingCostValue = () => {
    if (!selectedShipping) return 0;
    if (currency === "IDR") return selectedShipping.price;
    return Math.round(selectedShipping.price / 15700);
  };

  const formatPrice = (val: number) => {
    if (currency === "IDR") return `IDR ${val.toLocaleString("id-ID")}`;
    return `$${val.toFixed(2)}`;
  };

  // ── Step handlers ──────────────────────────────────────────────────────────

  const handleProceedToForm = () => {
    if (cartItems.length === 0) return;
    setCheckoutStep("form");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName || !shippingEmail || !shippingAddress || !shippingCity || !shippingPhone) {
      setFormError("Please fill out all shipping fields.");
      return;
    }
    setFormError("");
    setCheckoutStep("shipping");
  };

  const handlePlaceOrder = async () => {
    if (!selectedShipping) {
      setSubmitError("Please select a shipping method.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customerInfo: {
          name: shippingName,
          phone: shippingPhone,
          email: shippingEmail,
        },
        shippingAddress: {
          address: shippingAddress,
          city: shippingCity,
          postal_code: shippingPostal,
        },
        payment_method: "manual_transfer",
        is_preorder: false,
      };

      const order = await createOrder(payload);
      setOrderId(order.id);
      setOrderTotal(order.total_amount);
      setCheckoutStep("confirm");
    } catch (err: unknown) {
      setSubmitError((err as Error).message ?? "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderReset = () => {
    onClearCart();
    setCheckoutStep("bag");
    setOrderId(null);
    setOrderTotal(null);
    setActiveTab("story");
  };

  // ── Confirmation screen ────────────────────────────────────────────────────

  if (checkoutStep === "confirm") {
    const subtotal = calculateSubtotal();
    const shipping = shippingCostValue();
    const total = orderTotal ?? subtotal + shipping;

    return (
      <div className="w-full bg-brand-bg py-16 px-4 text-center transition-all duration-500 animate-fade-in animate-duration-300">
        <div className="max-w-xl mx-auto bg-brand-surface p-8 sm:p-12 rounded-[4px] border border-brand-accent/15 shadow-none space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-brand-bg text-[#C48A8F] rounded-full">
              <CheckCircle2 size={44} strokeWidth={1.5} />
            </div>
          </div>

          <p className="text-brand-accent font-sans text-[10px] uppercase tracking-[0.25em] font-bold">
            Order Confirmed
          </p>
          <h1 className="font-serif text-4xl text-brand-primary font-bold italic tracking-tighter leading-none">
            Thank you, {shippingName}
          </h1>
          <p className="text-brand-muted text-xs sm:text-sm leading-relaxed font-serif italic text-center">
            Your sacred prayer companion is on its way! Our artisan mothers are wrapping your parcel with care inside a signature Kechally box. A tracking code will be dispatched to{" "}
            <strong>{shippingEmail}</strong>.
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-brand-bg/80 border border-brand-accent/10 rounded-[4px] px-4 py-3 text-center">
              <p className="text-[10px] font-mono text-brand-muted uppercase tracking-widest mb-1">Order ID</p>
              <p className="font-mono text-xs text-brand-primary font-bold break-all">{orderId}</p>
            </div>
          )}

          {/* Receipt */}
          <div className="bg-brand-bg p-5 rounded-[4px] border border-brand-accent/10 text-left text-xs space-y-3 font-mono text-brand-muted">
            <h4 className="font-serif text-[11px] uppercase font-bold tracking-widest text-brand-primary pb-2 border-b border-brand-accent/10 mb-2">
              Kechally Invoice Summary
            </h4>
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {item.quantity}x {item.product.name} ({item.selectedColor.name})
                </span>
                <span>
                  {formatPrice((currency === "IDR" ? item.product.priceIDR : item.product.priceUSD) * item.quantity)}
                </span>
              </div>
            ))}
            <div className="h-[1px] bg-brand-accent/10 my-2" />
            {selectedShipping && (
              <div className="flex justify-between">
                <span>{selectedShipping.courier} {selectedShipping.service}</span>
                <span>{shippingCostDisplay()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-brand-primary text-sm border-t border-dashed border-brand-accent/20 pt-2 font-serif italic">
              <span>Total Paid</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="text-brand-muted text-[10px] space-y-1 font-mono">
            <p>Shipping to: {shippingAddress}, {shippingCity} {shippingPostal}</p>
            <p>Mobile: {shippingPhone}</p>
          </div>

          <button
            onClick={handleOrderReset}
            className="w-full bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent py-4 rounded-[4px] text-xs tracking-widest uppercase font-sans font-bold transition cursor-pointer"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    );
  }

  // ── Shipping method selection ───────────────────────────────────────────────

  if (checkoutStep === "shipping") {
    return (
      <div className="w-full bg-brand-bg py-16 px-4 transition-all duration-500">
        <div className="max-w-xl mx-auto bg-brand-surface p-6 sm:p-10 rounded-[4px] border border-brand-accent/15 shadow-none space-y-6">
          <button
            onClick={() => setCheckoutStep("form")}
            className="text-brand-muted hover:text-brand-primary text-[10px] uppercase tracking-widest font-sans font-bold cursor-pointer transition"
          >
            ← Back to Address
          </button>

          <div className="space-y-2">
            <span className="text-brand-accent text-[10px] font-sans tracking-widest uppercase block font-bold">
              Delivery Options
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold italic tracking-tighter leading-none">
              Shipping method.
            </h2>
            <p className="text-brand-muted text-xs font-serif italic">
              Choose your preferred courier and service level.
            </p>
          </div>

          {shippingLoading && (
            <div className="flex items-center justify-center py-8 space-x-2 text-brand-muted">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-serif italic">Loading shipping options...</span>
            </div>
          )}

          {shippingError && !shippingLoading && (
            <div className="flex items-start space-x-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-[4px] px-4 py-3 font-serif italic">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>Failed to load shipping methods. Please go back and retry.</span>
            </div>
          )}

          {!shippingLoading && !shippingError && shippingMethods.length > 0 && (
            <div className="space-y-3">
              {shippingMethods.map((method, idx) => {
                const display =
                  currency === "IDR"
                    ? `IDR ${method.price.toLocaleString("id-ID")}`
                    : `$${Math.round(method.price / 15700).toFixed(2)}`;
                const isSelected =
                  selectedShipping?.courier === method.courier &&
                  selectedShipping?.service === (method.service ?? (method as { Service?: string }).Service);

                const serviceName = method.service ?? (method as { Service?: string }).Service ?? "";

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedShipping({ ...method, service: serviceName })}
                    id={`shipping-option-${idx}`}
                    className={`w-full flex items-center justify-between p-4 rounded-[4px] border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/5"
                        : "border-brand-accent/20 bg-brand-bg hover:border-brand-accent/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Truck
                        size={16}
                        className={isSelected ? "text-brand-primary" : "text-brand-muted"}
                      />
                      <div>
                        <p className="font-sans text-xs font-bold text-brand-primary tracking-wide">
                          {method.courier}
                        </p>
                        <p className="font-serif text-[10px] italic text-brand-muted">
                          {serviceName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-sm font-bold italic text-brand-primary">{display}</p>
                      {isSelected && (
                        <p className="text-[9px] font-mono text-brand-accent uppercase tracking-wider">Selected</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {submitError && (
            <p className="text-xs text-red-700 font-serif italic flex items-center space-x-1.5">
              <AlertCircle size={13} />
              <span>{submitError}</span>
            </p>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={submitting || !selectedShipping || shippingLoading}
            id="place-order-btn"
            className={`w-full flex items-center justify-center space-x-2 text-xs tracking-widest font-sans font-bold uppercase py-4 rounded-[4px] transition-all duration-300 ${
              submitting || !selectedShipping || shippingLoading
                ? "bg-brand-accent/25 text-brand-accent/50 cursor-not-allowed"
                : "bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent cursor-pointer"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Placing Order...</span>
              </>
            ) : (
              <>
                <Package size={14} />
                <span>Place Order &amp; Confirm</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Main bag + form ────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-brand-bg py-12 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {checkoutStep === "form" ? (
          /* SHIPPING FORM */
          <div className="max-w-xl mx-auto bg-brand-surface p-6 sm:p-10 rounded-[4px] border border-brand-accent/15 shadow-none space-y-6">
            <button
              onClick={() => setCheckoutStep("bag")}
              className="text-brand-muted hover:text-brand-primary text-[10px] uppercase tracking-widest font-sans font-bold cursor-pointer transition"
            >
              ← Back to Shopping Bag
            </button>

            <div className="space-y-2">
              <span className="text-brand-accent text-[10px] font-sans tracking-widest uppercase block font-bold">
                Fulfillment Gateway
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold italic tracking-tighter leading-none">
                Shipping address.
              </h2>
              <p className="text-brand-muted text-xs font-serif italic">
                Please enter your accurate phone and city so our Malang dispatch team can expedite courier alignment.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/85 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="e.g. Erwin Hermanto"
                  className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/85 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={shippingEmail}
                    onChange={(e) => setShippingEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/85 mb-1.5">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    placeholder="e.g. +62 812-3456-7890"
                    className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/85 mb-1.5">
                  Complete Address
                </label>
                <textarea
                  rows={3}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street name, suite, house number, district..."
                  className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/85 mb-1.5">
                    City &amp; Country
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="e.g. Jakarta, Indonesia"
                    className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/85 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={shippingPostal}
                    onChange={(e) => setShippingPostal(e.target.value)}
                    placeholder="e.g. 12345"
                    className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-brand-accent text-xs flex items-center space-x-1.5 pt-1 font-serif italic">
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent transition text-xs tracking-widest font-sans font-bold py-4 uppercase rounded-[4px] cursor-pointer mt-2 flex items-center justify-center space-x-2"
              >
                <span>Continue to Shipping</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        ) : (
          /* SHOPPING BAG */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start animate-fade-in animate-duration-300">

            {/* Left: Item list */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border-b border-brand-accent/15 pb-4">
                <h1 className="font-serif text-5xl text-brand-primary font-bold italic tracking-tighter leading-none pb-2">
                  Shopping bag.
                </h1>
                <p className="text-brand-muted text-xs font-serif italic">
                  {cartItems.length} sacred companion{cartItems.length !== 1 ? "s" : ""} selected for daily prayers.
                </p>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-24 bg-brand-surface rounded-[4px] border border-brand-accent/15 p-8 space-y-5">
                  <AlertCircle size={32} className="mx-auto text-brand-accent/60" />
                  <p className="text-brand-muted text-xs sm:text-sm font-serif italic leading-relaxed">
                    Your shopping bag is currently empty. Our artisan weavers are always creating; find your perfect companion today.
                  </p>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent px-8 py-3.5 text-xs tracking-widest uppercase rounded-[4px] transition cursor-pointer font-sans font-bold"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-brand-accent/10 bg-brand-surface px-4 sm:px-6 rounded-[4px] border border-brand-accent/15">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-24 rounded-[4px] overflow-hidden bg-brand-bg shrink-0 border border-brand-accent/10 relative">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h3
                            onClick={() => setActiveTab("products")}
                            className="font-serif text-base text-brand-primary font-bold italic hover:text-brand-accent transition cursor-pointer"
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-[10px] font-sans font-bold text-brand-muted uppercase mt-0.5">
                            Color: <span className="text-brand-primary font-serif lowercase italic font-normal">{item.selectedColor.name}</span>
                          </p>
                          <p className="font-serif text-xs font-bold text-brand-primary mt-1.5">
                            {currency === "IDR"
                              ? `IDR ${item.product.priceIDR.toLocaleString("id-ID")}`
                              : `$${item.product.priceUSD.toFixed(2)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-6">
                        <div className="flex items-center border border-brand-accent/15 rounded-[4px] bg-brand-bg/50">
                          <button
                            onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                            className="px-2.5 py-1 text-xs text-brand-muted hover:text-brand-primary font-semibold cursor-pointer"
                          >
                            —
                          </button>
                          <span className="px-3 py-1 font-mono text-xs text-brand-primary font-bold min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="px-2.5 py-1 text-xs text-brand-muted hover:text-brand-primary font-semibold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-brand-muted hover:text-brand-primary text-xs font-sans uppercase tracking-wider flex items-center space-x-1 underline decoration-brand-accent/20 hover:decoration-brand-primary transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 shadow-none space-y-6">
                <h3 className="font-serif text-lg text-brand-primary font-bold italic tracking-tighter border-b border-brand-accent/15 pb-3">
                  Order summary.
                </h3>

                <div className="space-y-4 text-xs font-serif text-brand-muted italic">
                  <div className="flex justify-between">
                    <span className="not-italic">Subtotal</span>
                    <span className="font-serif not-italic font-bold text-brand-primary">
                      {formatPrice(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="not-italic">Shipping</span>
                    <span className="font-serif not-italic text-brand-muted">Calculated at next step</span>
                  </div>

                  <div className="h-[1px] bg-brand-accent/15 my-4" />

                  <div className="flex justify-between text-base font-serif italic font-bold text-brand-primary">
                    <span>Total</span>
                    <span className="font-serif font-bold not-italic text-lg text-brand-primary">
                      {formatPrice(calculateSubtotal())}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleProceedToForm}
                    disabled={cartItems.length === 0}
                    id="checkout-btn"
                    className={`w-full text-center text-xs tracking-widest font-sans font-bold uppercase py-4 rounded-[4px] transition-all duration-300 flex items-center justify-center space-x-2 ${
                      cartItems.length === 0
                        ? "bg-brand-accent/25 text-brand-accent/50 cursor-not-allowed"
                        : "bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent cursor-pointer"
                    }`}
                  >
                    <span>Proceed to Checkout</span>
                    {cartItems.length > 0 && <ArrowRight size={14} />}
                  </button>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="p-5 bg-brand-surface rounded-[4px] border border-brand-accent/15 space-y-4">
                <div className="flex items-start space-x-3 text-xs">
                  <ShieldCheck className="text-brand-primary shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="font-serif text-xs font-bold italic text-brand-primary">Handmade with Care</h5>
                    <p className="text-[11px] text-brand-muted font-serif italic mt-0.5 leading-relaxed text-justify">
                      Every order is meticulously quality-checked and packaged directly from our Malang workshop.
                    </p>
                  </div>
                </div>
                <div className="h-[1px] bg-brand-accent/10" />
                <div className="flex items-start space-x-3 text-xs">
                  <ShieldCheck className="text-brand-primary shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="font-serif text-xs font-bold italic text-brand-primary">Secure Fulfillments</h5>
                    <p className="text-[11px] text-brand-muted font-serif italic mt-0.5 leading-relaxed text-justify">
                      We offer Indonesian bank transfers, Mastercard processing, and DHL tracking guarantees.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
