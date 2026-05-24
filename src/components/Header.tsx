import { ShoppingBag, ChevronRight, Hash, Globe, Compass, Flower } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  activeTab: "story" | "products" | "values" | "bag";
  setActiveTab: (tab: "story" | "products" | "values" | "bag") => void;
  currency: "IDR" | "USD";
  setCurrency: (currency: "IDR" | "USD") => void;
  cartCount: number;
  onOpenCollaborate: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  cartCount,
  onOpenCollaborate,
}: HeaderProps) {
  const [reachedSection, setReachedSection] = useState(false);

  // Monitor scroll or state to see if they are viewing Reach or Values
  useEffect(() => {
    const handleScroll = () => {
      const reachEl = document.getElementById("global-reach-section");
      if (reachEl && activeTab === "values") {
        const rect = reachEl.getBoundingClientRect();
        // If the map is in view, consider active sub-navigation as Reach
        setReachedSection(rect.top < window.innerHeight / 2);
      } else {
        setReachedSection(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  const handleReachClick = () => {
    setActiveTab("values");
    setReachedSection(true);
    setTimeout(() => {
      const reachEl = document.getElementById("global-reach-section");
      if (reachEl) {
        reachEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleValuesClick = () => {
    setActiveTab("values");
    setReachedSection(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-bg/85 backdrop-blur-md border-b border-brand-pink/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Logo: "Kechally" in serif font with a tiny pink lily icon to its left */}
          <div 
            id="header-logo"
            onClick={() => {
              setActiveTab("story");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          >
            <Flower 
              size={15} 
              className="text-brand-pink fill-brand-pink/20 transition-transform duration-500 group-hover:rotate-12" 
            />
            <span className="font-serif text-2xl tracking-[0.2em] text-brand-primary font-bold italic transition duration-300 group-hover:text-brand-accent">
              Kechally
            </span>
          </div>

          {/* Desktop Navigation - Center-aligned, uppercase 11-12px with generous letter-spacing, elegant & minimal */}
          <nav className="hidden md:flex items-center justify-center space-x-6 lg:space-x-8 xl:space-x-10 mx-4">
            <button
              id="nav-story"
              onClick={() => {
                setActiveTab("story");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`text-[11px] tracking-[0.25em] font-sans font-bold uppercase transition-all duration-250 relative py-2 cursor-pointer ${
                activeTab === "story" 
                  ? "text-brand-primary" 
                  : "text-brand-muted hover:text-brand-primary"
              }`}
            >
              Story
              {activeTab === "story" && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-brand-accent rounded-full animate-fade-in" />
              )}
            </button>
            <button
              id="nav-products"
              onClick={() => {
                setActiveTab("products");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`text-[11px] tracking-[0.25em] font-sans font-bold uppercase transition-all duration-250 relative py-2 cursor-pointer ${
                activeTab === "products" 
                  ? "text-brand-primary" 
                  : "text-brand-muted hover:text-brand-primary"
              }`}
            >
              Products
              {activeTab === "products" && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-brand-accent rounded-full animate-fade-in" />
              )}
            </button>
            <button
              id="nav-values"
              onClick={handleValuesClick}
              className={`text-[11px] tracking-[0.25em] font-sans font-bold uppercase transition-all duration-250 relative py-2 cursor-pointer ${
                activeTab === "values" && !reachedSection
                  ? "text-brand-primary" 
                  : "text-brand-muted hover:text-brand-primary"
              }`}
            >
              Values
              {activeTab === "values" && !reachedSection && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-brand-accent rounded-full animate-fade-in" />
              )}
            </button>
            <button
              id="nav-reach"
              onClick={handleReachClick}
              className={`text-[11px] tracking-[0.25em] font-sans font-bold uppercase transition-all duration-250 relative py-2 cursor-pointer ${
                activeTab === "values" && reachedSection
                  ? "text-brand-primary" 
                  : "text-brand-muted hover:text-brand-primary"
              }`}
            >
              Reach
              {activeTab === "values" && reachedSection && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-brand-accent rounded-full animate-fade-in" />
              )}
            </button>
          </nav>

          {/* Utility Buttons & Collaborate CTA */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            {/* Currency Selector Pill */}
            <div className="hidden sm:flex items-center bg-brand-surface px-1 py-1 rounded-[4px] border border-brand-accent/15">
              <button
                id="currency-idr"
                onClick={() => setCurrency("IDR")}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-[2px] transition-all cursor-pointer ${
                  currency === "IDR"
                    ? "bg-brand-primary text-[#FDF8F5] shadow-none"
                    : "text-brand-muted hover:text-brand-primary"
                }`}
              >
                IDR
              </button>
              <button
                id="currency-usd"
                onClick={() => setCurrency("USD")}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-[2px] transition-all cursor-pointer ${
                  currency === "USD"
                    ? "bg-brand-primary text-[#FDF8F5] shadow-none"
                    : "text-brand-muted hover:text-brand-primary"
                }`}
              >
                USD
              </button>
            </div>

            {/* Shopping Bag Button */}
            <button
              id="header-bag-btn"
              onClick={() => setActiveTab("bag")}
              className="relative p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-[4px] transition duration-250 cursor-pointer"
              title="Shopping Bag"
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-primary text-[#FDF8F5] text-[9px] font-mono font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full ring-2 ring-brand-bg transition-transform duration-300">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Collaborate Button - A small filled CTA button "Collaborate" in dark rose-brown */}
            <button
              id="header-collab-btn"
              onClick={onOpenCollaborate}
              className="bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent font-sans text-[11px] tracking-[0.15em] uppercase px-4 py-2.5 rounded-[4px] transition duration-250 font-bold cursor-pointer"
            >
              Collaborate
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar - Now reflects Story, Products, Values, Reach */}
        <div className="md:hidden flex justify-around py-2.5 border-t border-brand-pink/20">
          <button
            onClick={() => {
              setActiveTab("story");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`text-[10px] tracking-widest uppercase font-bold ${
              activeTab === "story" ? "text-brand-primary border-b border-brand-accent pb-0.5" : "text-brand-muted"
            }`}
          >
            Story
          </button>
          <button
            onClick={() => {
              setActiveTab("products");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`text-[10px] tracking-widest uppercase font-bold ${
              activeTab === "products" ? "text-brand-primary border-b border-brand-accent pb-0.5" : "text-brand-muted"
            }`}
          >
            Products
          </button>
          <button
            onClick={handleValuesClick}
            className={`text-[10px] tracking-widest uppercase font-bold ${
              activeTab === "values" && !reachedSection ? "text-brand-primary border-b border-brand-accent pb-0.5" : "text-brand-muted"
            }`}
          >
            Values
          </button>
          <button
            onClick={handleReachClick}
            className={`text-[10px] tracking-widest uppercase font-bold ${
              activeTab === "values" && reachedSection ? "text-brand-primary border-b border-brand-accent pb-0.5" : "text-brand-muted"
            }`}
          >
            Reach
          </button>
        </div>

      </div>
    </header>
  );
}
