/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StoryView from "./components/StoryView";
import CollectionGrid from "./components/CollectionGrid";
import ProductDetail from "./components/ProductDetail";
import ValuesView from "./components/ValuesView";
import CartView from "./components/CartView";
import CollaborateModal from "./components/CollaborateModal";
import { CartItem, Product, adaptApiProduct } from "./data";
import { getProduct } from "./api/tokovio";
import { useProducts } from "./hooks/useProducts";
import { Sparkles } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"story" | "products" | "values" | "bag">("story");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Pre-fetch the full products list so we can resolve IDs quickly
  const { products: apiProducts } = useProducts();

  // When selectedProductId changes, resolve to a full Product object
  useEffect(() => {
    if (!selectedProductId) {
      setSelectedProduct(null);
      return;
    }

    // Check local cache from already-fetched list first
    const idx = apiProducts.findIndex((p) => p.id === selectedProductId);
    if (idx !== -1) {
      setSelectedProduct(adaptApiProduct(apiProducts[idx], idx));
      return;
    }

    // Fallback: fetch individual product by ID
    getProduct(selectedProductId)
      .then((api) => setSelectedProduct(adaptApiProduct(api, 0)))
      .catch(() => setSelectedProduct(null));
  }, [selectedProductId, apiProducts]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (tab: "story" | "products" | "values" | "bag") => {
    if (tab === "products") {
      setSelectedProductId(null);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product: Product, qty: number, color: { name: string; hex: string }) => {
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedColor.name === color.name
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += qty;
        return updated;
      } else {
        return [...prevItems, { product, quantity: qty, selectedColor: color, currency }];
      }
    });
  };

  const handleUpdateQuantity = (idx: number, qty: number) => {
    setCartItems((prevItems) => {
      const updated = [...prevItems];
      updated[idx].quantity = qty;
      return updated;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between font-sans selection:bg-brand-primary/20 selection:text-brand-primary-dark">

      {/* Premium Notification Promo Ticker */}
      <div className="w-full bg-brand-primary-dark text-[#FDF8F5] py-2.5 px-4 text-center text-[10px] sm:text-xs tracking-[0.2em] font-mono flex items-center justify-center space-x-2 border-b border-brand-primary/10 z-50 uppercase">
        <Sparkles size={11} className="text-brand-pink animate-pulse" />
        <span>Free Priority Shipping Across Indonesia. International dispatch via DHL.</span>
      </div>

      {/* Dynamic Header Component */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currency={currency}
        setCurrency={setCurrency}
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCollaborate={() => setCollaborationOpen(true)}
      />

      {/* Main Switchboard Route Frame */}
      <main className="flex-grow">
        {activeTab === "story" && (
          <div className="fade-in-up">
            <StoryView
              setActiveTab={handleTabChange}
              onSelectProduct={handleSelectProduct}
              currency={currency}
              onOpenCollaborate={() => setCollaborationOpen(true)}
            />
          </div>
        )}

        {activeTab === "products" && (
          <div className="fade-in-up">
            {selectedProduct ? (
              <ProductDetail
                product={selectedProduct}
                onBack={() => setSelectedProductId(null)}
                onAddToCart={handleAddToCart}
                currency={currency}
              />
            ) : (
              <CollectionGrid
                onSelectProduct={handleSelectProduct}
                currency={currency}
              />
            )}
          </div>
        )}

        {activeTab === "values" && (
          <div className="fade-in-up">
            <ValuesView />
          </div>
        )}

        {activeTab === "bag" && (
          <div className="fade-in-up">
            <CartView
              cartItems={cartItems}
              currency={currency}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              setActiveTab={handleTabChange}
              onViewOrder={(orderId) => {
                // Navigate to the dedicated order detail page
                window.location.href = `/orders/${orderId}`;
              }}
            />
          </div>
        )}
      </main>

      {/* Dynamic Brand Footer */}
      <Footer
        setActiveTab={handleTabChange}
        onSelectProduct={handleSelectProduct}
      />

      {/* Collaboration Sidebar/Modal intake form */}
      <CollaborateModal
        isOpen={collaborationOpen}
        onClose={() => setCollaborationOpen(false)}
      />

    </div>
  );
}
