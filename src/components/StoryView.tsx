import { useState } from "react";
  import { ArrowLeft, ArrowRight, Star, Heart, Compass, Globe, Sparkles, Quote, Menu } from "lucide-react";
  import { TESTIMONIALS, Product, adaptApiProduct } from "../data";
  import { useProducts } from "../hooks/useProducts";
  import { useStore } from "../hooks/useStore";
  
  const MARQUEE_ITEMS = [
    "Handmade in Malang",
    "Sulam Tangan",
    "Premium Mukena",
    "Ships Worldwide",
    "Empowering Artisans",
    "Syar'i & Elegant"
  ];

  interface StoryViewProps {
    setActiveTab: (tab: "story" | "products" | "values" | "bag") => void;
    onSelectProduct: (productId: string) => void;
    currency: "IDR" | "USD";
    onOpenCollaborate?: () => void;
  }
  
  export default function StoryView({ setActiveTab, onSelectProduct, currency, onOpenCollaborate }: StoryViewProps) {
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    
    // Fetch live store metadata and theme config
    const { store, parsedTheme } = useStore();

    // Fetch live products for the featured carousel
    const { products: apiProducts } = useProducts();
    const featuredProducts: Product[] = apiProducts.slice(0, 4).map((p, i) => adaptApiProduct(p, i));

    // ── Dynamic content derivations (with hardcoded fallbacks) ─────────────────
    const DEFAULT_MARQUEE = ["Handmade in Malang", "Sulam Tangan", "Premium Mukena", "Ships Worldwide", "Empowering Artisans", "Syar'i & Elegant"];
    const marqueeItems = parsedTheme?.marquee?.items?.length ? parsedTheme.marquee.items : DEFAULT_MARQUEE;

    const heroStats = parsedTheme?.hero?.stats?.length
      ? parsedTheme.hero.stats
      : [{ value: "1900+", label: "Pieces Sold" }, { value: "6", label: "Countries" }, { value: "30+", label: "Artisans" }];

    const impactStats = parsedTheme?.socialImpact?.stats?.length
      ? parsedTheme.socialImpact.stats
      : [{ value: "30+", label: "Artisan Mothers" }, { value: "1900+", label: "Pieces in 2025" }, { value: "6", label: "Countries" }, { value: "15+", label: "Years of Craft" }];

    const handleNextCarousel = () => {
      setCarouselIndex((prev) => (prev + 1) % (featuredProducts.length - 1));
    };
  
    const handlePrevCarousel = () => {
      setCarouselIndex((prev) => (prev - 1 + (featuredProducts.length - 1)) % (featuredProducts.length - 1));
    };
  
    const handleNextTestimonial = () => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    };
  
    const formatPrice = (prod: Product) => {
      if (currency === "IDR") {
        return `IDR ${prod.priceIDR.toLocaleString("id-ID")}`;
      } else {
        return `$${prod.priceUSD.toFixed(2)}`;
      }
    };
  
    return (
      <div className="w-full bg-brand-bg transition-all duration-500">
        
        {/* HOMEPAGE HERO SECTION */}
        <section id="hero-section" className="relative w-full bg-brand-bg border-b border-brand-primary/10 overflow-hidden py-12 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center">
              
              {/* Left Column - Content */}
              <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left animate-fade-in animate-duration-500">
                
                {/* Small eyebrow label in uppercase with a short horizontal line */}
                <div className="flex items-center space-x-3 text-brand-accent">
                  <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.25em]">
                    {parsedTheme?.hero?.eyebrow || "CRAFTED BY THE LOCALS"}
                  </span>
                  <div className="h-[1px] w-8 bg-brand-accent/40" />
                </div>

                {/* Large serif headline spanning 3 lines */}
                <h1 className="font-serif text-[42px] sm:text-[54px] lg:text-[64px] text-brand-primary leading-[1.08] font-normal tracking-tight">
                  {parsedTheme?.hero?.title ? (
                    <span>{parsedTheme.hero.title}</span>
                  ) : (
                    <>
                      Premium <br />
                      <span className="font-serif italic font-bold text-brand-accent">Handmade</span> Mukena <br />
                      for the Modern Muslimah
                    </>
                  )}
                </h1>

                {/* One paragraph of supporting body text, muted color, max 280 characters */}
                <p className="text-brand-muted text-xs sm:text-sm md:text-base leading-relaxed font-serif italic max-w-lg">
                  {parsedTheme?.hero?.description || store?.description || "Meticulously hand-embroidered by local artisan mothers in Malang. Blending traditional craftsmanship with the cooling restraint of organic cotton-rayon to accompany your sacred moments."}
                </p>

                {/* Two CTA elements inline */}
                <div className="flex flex-wrap items-center gap-5 pt-2">
                  <button
                    onClick={() => setActiveTab("products")}
                    className="bg-[#5A3A3A] text-[#FDF8F5] hover:bg-brand-accent transition-all duration-300 transform active:scale-[0.98] text-xs font-sans font-bold px-8 py-4 rounded-[4px] tracking-widest uppercase cursor-pointer"
                  >
                    {parsedTheme?.hero?.primaryCta || "Explore Collection"}
                  </button>
                  <button
                    onClick={() => {
                      const carouselSection = document.getElementById("story-detail-section");
                      if (carouselSection) {
                        carouselSection.scrollIntoView({ behavior: "smooth" });
                      } else {
                        window.scrollTo({ top: window.innerHeight * 0.8, behavior: "smooth" });
                      }
                    }}
                    className="text-brand-primary hover:text-brand-accent transition-colors duration-300 text-xs font-sans font-bold tracking-widest uppercase flex items-center space-x-1.5 cursor-pointer group"
                  >
                    <span>{parsedTheme?.hero?.secondaryCta || "Our Story"}</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>

                {/* Three horizontal stat items below a thin divider line */}
                <div className="pt-8 border-t border-brand-accent/25">
                  <div className="grid grid-cols-3 gap-6 sm:gap-10">
                    {heroStats.map((stat, i) => (
                      <div key={i}>
                        <p className="font-serif text-3xl sm:text-4xl text-brand-primary italic font-bold leading-none">{stat.value}</p>
                        <p className="text-[10px] uppercase tracking-widest text-brand-muted font-sans font-bold mt-1.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column - Soft pink editorial image placeholder */}
              <div className="lg:col-span-6 flex justify-center animate-fade-in animate-duration-700">
                <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] sm:aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] group">
                  
                  {/* Organic rounded pebble-shaped container with soft blush pink bg */}
                  <div className="absolute inset-0 bg-[#FAF0F0] rounded-[60%_40%_50%_50%_/_50%_40%_60%_50%] hover:rounded-[50%_50%_50%_50%] overflow-hidden border border-brand-accent/15 transition-all duration-1000 ease-in-out shadow-xs">
                    
                    {/* Subtle dust/grain texture SVG overlay */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none mix-blend-overlay z-10 animate-pulse-slow">
                      <filter id="heroNoiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
                      </filter>
                      <rect width="100%" height="100%" filter="url(#heroNoiseFilter)" />
                    </svg>

                    {/* Gradient vignetting overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/15 via-transparent to-transparent z-10 mix-blend-multiply" />

                    {/* Soft coral pink product photograph */}
                    <img
                      src={parsedTheme?.hero?.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&w=800&q=80"}
                      alt="Organic soft blush-pink fabric drapery as elegant mukena placeholder"
                      className="w-full h-full object-cover saturate-[0.80] contrast-[0.95] mix-blend-multiply opacity-90 scale-100 group-hover:scale-102 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Floating mini card in the lower-left corner */}
                  <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-brand-bg border border-brand-accent/20 p-4 rounded-[4px] shadow-xs z-20 flex items-center space-x-4 max-w-[280px]">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
                        <span className="text-[9px] font-sans font-bold text-brand-accent uppercase tracking-[0.2em]">{parsedTheme?.hero?.floatingCardTag || "New Arrival"}</span>
                      </div>
                      <p className="font-serif text-sm font-bold text-brand-primary italic">{parsedTheme?.hero?.floatingCardTitle || "Mukena Padi"}</p>
                      <p className="text-[9px] font-sans text-brand-muted uppercase tracking-wider font-bold">{parsedTheme?.hero?.floatingCardSubtitle || "Handcrafted · Malang"}</p>
                    </div>
                    
                    <div className="h-10 w-[1px] bg-brand-accent/15" />
                    
                    {/* Circle tag badge with spinning accent */}
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 animate-spin rounded-full border border-brand-accent/25 bg-brand-surface" style={{ animationDuration: "24s" }}>
                      <span className="text-[8px] font-sans font-black text-brand-accent uppercase tracking-[0.1em]">NEW</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* LUXURY BRAND TICKER MARQUEE */}
        <div className="w-full bg-[#5A3A3A] py-3.5 border-y border-brand-pink/20 overflow-hidden select-none flex">
          <div className="animate-marquee flex items-center whitespace-nowrap">
            {/* Set 1 */}
            {Array(4).fill(marqueeItems).flat().map((item, idx) => (
              <div key={`set-a-${idx}`} className="flex items-center inline-flex shrink-0">
                <span className="mx-6 sm:mx-8 text-[11px] font-sans font-bold text-[#FDF8F5]/85 tracking-[0.25em] uppercase">
                  {item}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-pink shrink-0" />
              </div>
            ))}
          </div>
          <div className="animate-marquee flex items-center whitespace-nowrap" aria-hidden="true">
            {/* Set 2 (Mirror Copy) */}
            {Array(4).fill(marqueeItems).flat().map((item, idx) => (
              <div key={`set-b-${idx}`} className="flex items-center inline-flex shrink-0">
                <span className="mx-6 sm:mx-8 text-[11px] font-sans font-bold text-[#FDF8F5]/85 tracking-[0.25em] uppercase">
                  {item}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-pink shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* ABOUT KECHALLY SECTION */}
        <section id="about-section" className="py-20 md:py-28 bg-[#FDF8F5] border-b border-brand-primary/10 overflow-hidden px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column - Visual Panel */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-[24px] bg-[#FAF0F0] overflow-hidden flex items-center justify-center border border-brand-accent/15 shadow-xs">
                  
                  {parsedTheme?.about?.image ? (
                    <img
                      src={parsedTheme.about.image}
                      alt={parsedTheme?.about?.headline || "About Kechally"}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  ) : (
                    <>
                      {/* Subtle circular gradient behind the lily */}
                      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#C48A8F]/25 to-transparent filter blur-2xl opacity-70 z-0" />
                      
                      {/* Faded year "2010" watermark inside */}
                      <span className="absolute select-none pointer-events-none font-serif text-[120px] sm:text-[144px] text-[#C48A8F]/5 font-bold tracking-tighter leading-none z-0">
                        2010
                      </span>
                      
                      {/* SVG Lily illustration with pink gradient petals */}
                      <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-64 sm:h-64 relative z-10 filter drop-shadow-[0_4px_12px_rgba(196,138,143,0.15)] animate-pulse-slow">
                        <defs>
                          <linearGradient id="lilyPink" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C48A8F" stopOpacity="0.85" />
                            <stop offset="60%" stopColor="#EAA89B" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#FAF0F0" stopOpacity="0.95" />
                          </linearGradient>
                          <linearGradient id="lilyPinkDark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#C48A8F" />
                            <stop offset="100%" stopColor="#9C5A60" />
                          </linearGradient>
                        </defs>
                        {/* Background petals for soft feel */}
                        <path d="M100,50 Q130,90 100,150 Q70,90 100,50" fill="url(#lilyPink)" transform="rotate(45, 100, 100)" opacity="0.6" />
                        <path d="M100,50 Q130,90 100,150 Q70,90 100,50" fill="url(#lilyPink)" transform="rotate(-45, 100, 100)" opacity="0.6" />
                        
                        {/* Main glowing petals */}
                        <path d="M100,50 Q122,100 100,150 Q78,100 100,50" fill="url(#lilyPink)" />
                        <path d="M100,50 Q155,80 130,130 Q105,110 100,50" fill="url(#lilyPink)" transform="rotate(25, 100, 100)" />
                        <path d="M100,50 Q45,80 70,130 Q95,110 100,50" fill="url(#lilyPink)" transform="rotate(-25, 100, 100)" />
                        <path d="M100,50 Q165,115 108,145 Q100,110 100,50" fill="url(#lilyPink)" transform="rotate(60, 100, 100)" />
                        <path d="M100,50 Q35,115 92,145 Q100,110 100,50" fill="url(#lilyPink)" transform="rotate(-60, 100, 100)" />
                        
                        {/* Inner detail petals */}
                        <path d="M100,70 Q112,100 100,130 Q88,100 100,70" fill="#FAF0F0" opacity="0.4" />
                        
                        {/* Delicate golden/pink pistils resembling high-end fashion illustration */}
                        <path d="M100,135 Q100,105 104,85" stroke="url(#lilyPinkDark)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        <circle cx="104" cy="85" r="3" fill="url(#lilyPinkDark)" />
                        
                        <path d="M100,135 Q94,103 86,90" stroke="url(#lilyPinkDark)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        <circle cx="86" cy="90" r="3" fill="url(#lilyPinkDark)" />
                        
                        <path d="M100,135 Q106,103 114,93" stroke="url(#lilyPinkDark)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        <circle cx="114" cy="93" r="3" fill="url(#lilyPinkDark)" />
                      </svg>
                    </>
                  )}
                  
                  {/* Subtle noise grain vector overlay */}
                  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none mix-blend-overlay z-10">
                    <filter id="aboutNoise">
                      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#aboutNoise)" />
                  </svg>
                </div>
              </div>
              
              {/* Right Column - Text Content */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
                
                {/* Eyebrow Label */}
                <div className="flex items-center space-x-3 text-brand-accent">
                  <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.25em]">
                    {parsedTheme?.about?.eyebrow || "ABOUT KECHALLY"}
                  </span>
                  <div className="h-[1px] w-8 bg-brand-accent/40" />
                </div>
                
                {/* Serif headline */}
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-primary leading-[1.15] font-normal tracking-tight">
                  {parsedTheme?.about?.headline ? (
                    <span>{parsedTheme.about.headline}</span>
                  ) : (
                    <>
                      Bukan sekadar mukena, <br />
                      <span className="font-serif italic font-bold text-brand-accent">teman dalam perjalanan</span> <br />
                      ibadah muslimah.
                    </>
                  )}
                </h2>
                
                {/* Two short body paragraphs */}
                <div className="space-y-4 sm:space-y-5 text-brand-muted font-serif italic text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl text-justify">
                  <p>
                    {parsedTheme?.about?.body1 || "Lahir dari sanubari kota Malang pada tahun 2010, Kechally tumbuh dari keyakinan mendalam bahwa setiap detik ibadah berhak dipeluk kenyamanan terbaik. Kami merajut serat katun-rayon organik berkualitas premium dengan sentuhan magis sulam tangan tradisional, merayakan dedikasi hening dalam keanggunan yang bersahaja."}
                  </p>
                  <p className="font-sans not-italic text-xs sm:text-sm">
                    {parsedTheme?.about?.body2 || "Setiap jalinan motif adalah jembatan kesejahteraan bagi puluhan ibu rumah tangga di Malang. Melalui kemitraan etis ini, kami memberdayakan pengrajin lokal melalui sistem upah yang adil, jadwal pengerjaan jarak jauh yang toleran terhadap tugas domestik, dan jaminan penunjang keluarga demi mewujudkan kedaulatan ekonomi mandiri."}
                  </p>
                </div>
                
                {/* 2-column mini-timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-brand-accent/15">
                  {(parsedTheme?.about?.timeline ?? [
                    { year: "2010", description: "Home-based, single founder, 10 pieces at a time." },
                    { year: "2025", description: "Mid-scale UMKM — 4 in-house + 30 artisan partners." },
                  ]).map((item, i) => (
                    <div key={i} className="border-l-2 border-[#C48A8F] pl-4 py-1 space-y-1">
                      <p className="font-serif text-lg font-bold text-brand-primary italic">{item.year}</p>
                      <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">{item.description}</p>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* SOCIAL IMPACT SECTION */}
        <section id="social-impact-section" className="py-24 bg-[#5A3A3A] border-b border-brand-primary/10 overflow-hidden px-4 sm:px-6 lg:px-12 text-center">
          <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
            
            {/* Small rose-colored eyebrow logo/label */}
            <div className="flex items-center justify-center space-x-3 text-brand-pink">
              <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.25em]">
                {parsedTheme?.socialImpact?.eyebrow || "SOCIAL IMPACT"}
              </span>
              <div className="h-[1px] w-8 bg-brand-pink/30" />
            </div>

            {/* Large serif headline in cream */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#FDF8F5] leading-[1.2] font-normal tracking-tight max-w-3xl mx-auto">
              {parsedTheme?.socialImpact?.headline ? (
                <span>{parsedTheme.socialImpact.headline}</span>
              ) : (
                <>Empowering <span className="font-serif italic font-bold text-[#FAF0F0]">local hands</span>, transforming lives</>
              )}
            </h2>

            {/* Short body paragraph in muted cream */}
            <p className="text-brand-bg/85 text-xs sm:text-sm md:text-base leading-relaxed font-serif italic max-w-2xl mx-auto">
              {parsedTheme?.socialImpact?.body || "Behind each meticulous stitch is an artisan mother in rural Malang, crafting her family's future with dignified dedication. Through sustainable wages, healthcare support, and flexible home-based schedules, we honor their quiet devotion and build generational resilience—one prayer at a time."}
            </p>

            {/* A 4-column stat bar below with thin rose borders between each */}
            <div className="pt-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 border border-brand-pink/20 rounded-[8px] bg-[#513333] overflow-hidden">
                {impactStats.map((stat, i) => (
                  <div
                    key={i}
                    className={`p-8 flex flex-col items-center justify-center space-y-1.5 ${
                      i < impactStats.length - 1 ? "border-r border-brand-pink/15" : ""
                    } ${i < 2 ? "border-b lg:border-b-0" : ""}`}
                  >
                    <span className="font-serif text-4xl sm:text-5xl text-brand-surface italic font-bold leading-none select-none">
                      {stat.value}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#E8B4B8]/75 font-sans font-bold text-center">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* SELECTED PIECES CAROUSEL - Screen 2 */}
        <section className="py-20 bg-brand-bg relative border-b border-brand-primary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left text column */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-brand-accent font-mono text-[10px] uppercase tracking-[0.25em] font-semibold block">
                  {parsedTheme?.selectedPieces?.eyebrow || "Seasonal Features"}
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl text-brand-primary md:leading-[1.1] font-black tracking-tighter leading-none italic">
                  {parsedTheme?.selectedPieces?.headline || "Selected Pieces"}
                </h2>
                <div className="h-[1px] bg-brand-accent/20 w-24" />
                <p className="text-brand-muted text-xs sm:text-sm leading-relaxed font-serif text-justify italic">
                  {parsedTheme?.selectedPieces?.body1 || "Delicate hand-embroidery on the finest, lightweight fabric. A graceful companion for daily prayer and sacred moments, adorned with care by local skilled artisan mothers in Malang. Each single Kechally mukena is crafted using traditional techniques, ensuring that each piece is unique, beautiful, and remarkably comfortable."}
                </p>
                <p className="text-brand-muted text-xs text-justify font-sans leading-relaxed">
                  {parsedTheme?.selectedPieces?.body2 || "Made from premium breathable cotton-rayon blend to ensure cooling comfort even in hot, tropical climates. Our pieces are tailored so you can experience tranquil, uninterrupted prayer."}
                </p>
                <div className="pt-4 flex items-center space-x-6">
                  <button
                    onClick={() => setActiveTab("products")}
                    className="bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent text-[10px] tracking-widest uppercase font-sans font-bold px-6 py-3 rounded-[4px] transition duration-300 cursor-pointer shadow-xs"
                  >
                    View All Products
                  </button>
                  
                  {/* Slider controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevCarousel}
                      className="p-2.5 border border-brand-primary text-brand-primary hover:bg-brand-bg-accent rounded-[4px] transition duration-200 cursor-pointer"
                      title="Previous Item"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      onClick={handleNextCarousel}
                      className="p-2.5 border border-brand-primary text-brand-primary hover:bg-brand-bg-accent rounded-[4px] transition duration-200 cursor-pointer"
                      title="Next Item"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right sliding cards list */}
              <div className="lg:col-span-7 overflow-hidden py-4">
                <div 
                  className="flex gap-6 transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${carouselIndex * 50}%)` }}
                >
                  {featuredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod.id)}
                      className="w-[280px] sm:w-[320px] shrink-0 group cursor-pointer bg-brand-surface p-5 rounded-[4px] border border-brand-accent/15 transition-all duration-300 hover:bg-brand-primary-light hover:-translate-y-1"
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-[4px] bg-brand-bg mb-4 relative border border-brand-accent/10">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 bg-brand-primary text-[#FDF8F5] text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-[4px] font-bold shadow-xs">
                          {prod.tag}
                        </span>
                      </div>
                      <div className="flex justify-between items-start space-x-2 mt-2">
                        <div>
                          <p className="text-[10px] text-brand-accent font-mono tracking-wider font-semibold">
                            No. {prod.num}
                          </p>
                          <h3 className="font-serif text-lg text-brand-primary font-bold italic group-hover:text-brand-accent transition">
                            {prod.name}
                          </h3>
                        </div>
                        <p className="font-serif italic text-xs font-bold text-brand-primary mt-1.5 bg-brand-bg px-2 py-0.5 rounded-[4px] border border-brand-accent/10 animate-fade-in">
                          {formatPrice(prod)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DESIGNED TESTIMONIAL SECTION */}
        <section id="luxury-testimonial-section" className="py-28 sm:py-36 md:py-40 bg-[#FAF0F0] text-center relative overflow-hidden flex items-center justify-center">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            
            {/* Large decorative open-quote mark in light rose at the top (Cormorant Garamond, ~80px) */}
            <span className="font-serif text-[80px] text-brand-pink/50 block leading-none select-none font-light mb-4">
              “
            </span>
            
            {/* Large italic serif testimonial quote */}
            <p className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-[32px] italic text-brand-primary leading-relaxed sm:leading-relaxed md:leading-[1.45] font-normal tracking-wide max-w-4xl mx-auto text-center">
              {parsedTheme?.testimonial?.quote || "I really like this product — I even use it myself often. The quality is good, it's comfortable to wear, and I feel like sharing it with everyone."}
            </p>
            
            {/* Attribution below with flanking horizontal lines */}
            <div className="flex items-center justify-center space-x-4 sm:space-x-6 mt-12">
              <div className="h-[1px] w-8 sm:w-16 bg-brand-pink/65" />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-brand-muted font-sans font-bold whitespace-nowrap">
                {parsedTheme?.testimonial?.attribution || "— Sofia, Customer from the Netherlands"}
              </span>
              <div className="h-[1px] w-12 sm:w-16 bg-brand-pink/65" />
            </div>

          </div>
        </section>

        {/* FULL-WIDTH COLLABORATION CTA SECTION */}
        <section id="collaboration-cta-section" className="relative w-full bg-[#F5E0E2] py-28 sm:py-36 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 border-b border-brand-primary/10 select-none">
          
          {/* Large subtle watermark text centered behind all content (10% opacity) */}
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0 overflow-hidden">
            <span className="font-serif font-bold text-[18vw] sm:text-[15vw] text-[#5A3A3A] opacity-10 tracking-tighter leading-none">
              Kechally
            </span>
          </div>

          {/* Centered content on top of watermark */}
          <div className="relative z-10 max-w-3xl mx-auto space-y-6 sm:space-y-8">
            
            {/* Eyebrow Label */}
            <div className="flex items-center justify-center space-x-3 text-[#5A3A3A]">
              <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.25em]">
                {parsedTheme?.collaboration?.eyebrow || "LET'S COLLABORATE"}
              </span>
              <div className="h-[1px] w-6 bg-[#5A3A3A]/40" />
            </div>

            {/* Serif headline */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#5A3A3A] leading-[1.2] font-normal tracking-tight">
              {parsedTheme?.collaboration?.headline ? (
                <span>{parsedTheme.collaboration.headline}</span>
              ) : (
                <>Ready to bring <span className="font-serif italic font-bold">Kechally</span> to your audience?</>
              )}
            </h2>

            {/* Short body copy */}
            <p className="text-[#5A3A3A]/85 text-xs sm:text-sm md:text-base leading-relaxed font-serif italic max-w-xl mx-auto">
              {parsedTheme?.collaboration?.body || "We welcome resellers, dropshippers, and brand collaborations worldwide."}
            </p>

            {/* Two CTA elements: a dark rose-brown button and a text link */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-4">
              <button
                onClick={() => onOpenCollaborate ? onOpenCollaborate() : setActiveTab("values")}
                className="w-full sm:w-auto bg-[#5A3A3A] text-[#FDF8F5] hover:bg-brand-primary border border-[#5A3A3A] hover:border-brand-primary font-sans font-bold text-[10px] tracking-widest uppercase px-8 py-4 rounded-[4px] transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
              >
                {parsedTheme?.collaboration?.primaryCta || "Get in Touch"}
              </button>
              <a
                href={`https://instagram.com/${parsedTheme?.collaboration?.instagramHandle || "kechally"}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#5A3A3A] hover:text-brand-primary text-[10px] sm:text-xs tracking-widest uppercase font-sans font-bold transition duration-200 cursor-pointer flex items-center space-x-1.5 hover:underline underline-offset-4"
              >
                <span>@{parsedTheme?.collaboration?.instagramHandle || "kechally"}</span>
                <span>→</span>
              </a>
            </div>

          </div>

        </section>

      </div>
    );
  }
